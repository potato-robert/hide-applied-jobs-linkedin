const OBSERVER_DEBOUNCE_MS = 300;
const NAV_ROUTE_DELAY_MS = 800;

function init() {
    // ---------------------------------------------------------------------------
    // getJobItems()
    //
    // Returns one element per job card, supporting three LinkedIn layouts:
    //
    //  1. Legacy BEM layout  — .jobs-search-results__list-item / .scaffold-layout__list-item
    //  2. New /jobs/search-results/ layout — [role="button"][componentkey^="job-card-component-ref-"]
    //  3. Older layout — div[role="button"][componentkey] with UUID keys
    // ---------------------------------------------------------------------------
    function getJobItems() {
        const legacy = Array.from(document.querySelectorAll(
            '.jobs-search-results__list-item, .scaffold-layout__list-item'
        ));
        if (legacy.length > 0) return legacy;

        const byJobCardRef = Array.from(document.querySelectorAll(
            '[role="button"][componentkey^="job-card-component-ref-"]'
        ));
        if (byJobCardRef.length > 0) return byJobCardRef;

        const scope =
            document.querySelector('[data-testid="lazy-column"]') ??
            document.querySelector('#workspace') ??
            document.querySelector('main') ??
            document.body;

        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const seen = new Set();
        const byUuid = Array.from(scope.querySelectorAll('[role="button"][componentkey]'))
            .filter(el => {
                const key = el.getAttribute('componentkey');
                if (!key || !uuidPattern.test(key)) return false;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        if (byUuid.length > 0) return byUuid;

        return [];
    }

    // ---------------------------------------------------------------------------
    // isApplied(item)
    // ---------------------------------------------------------------------------
    const appliedTranslations = [
        'Applied',                  // English
        'Solicitados',              // Spanish
        'Candidature envoyée',      // French
        'Beworben',                 // German
        'Candidatura inviata',      // Italian
        'Candidatura enviada',      // Portuguese
        'Sollicitatie verzonden',   // Dutch
        'Ansökt',                   // Swedish
        'Søgt',                     // Danish
        'Søkt',                     // Norwegian
        'Haettu',                   // Finnish
        'Zaaplikowano',             // Polish
        'Přihlášeno',               // Czech
        'Jelentkezett'              // Hungarian
    ];
    const appliedSet = new Set(appliedTranslations.map(t => t.toLowerCase()));

    function isApplied(item) {
        const textMatch = Array.from(item.querySelectorAll('li, p, span, div')).some(el => {
            const text = el.textContent.trim();
            return appliedSet.has(text.toLowerCase());
        });
        if (textMatch) return true;

        const ariaMatch = Array.from(item.querySelectorAll('[aria-label]')).some(el => {
            const label = el.getAttribute('aria-label');
            if (!label) return false;
            const lower = label.toLowerCase();
            return appliedTranslations.some(t => lower.includes(t.toLowerCase()));
        });
        if (ariaMatch) return true;

        return !!item.querySelector('[class*="applied" i]');
    }

    // ---------------------------------------------------------------------------
    // hideJobItems()
    // ---------------------------------------------------------------------------
    function hideJobItems() {
        const jobItems = getJobItems();
        if (jobItems.length === 0) return;

        let appliedJobsHidden = 0;
        const keywordMatches = {};

        // Defaults must match options.js restoreOptions() so UI and runtime stay aligned
        chrome.storage.sync.get(
            {
                keywords: '',
                caseInsensitive: true,
                mode: 'hide',
                highlightColor: '#ffeaea'
            },
            (result) => {
                const keywords = result.keywords
                    ? result.keywords.split(',').map(k => k.trim()).filter(Boolean)
                    : [];
                const caseInsensitive = result.caseInsensitive ?? true;
                const mode = result.mode || 'none';
                const highlightColor = result.highlightColor || '#ffeaea';

                keywords.forEach(keyword => { keywordMatches[keyword] = 0; });

                jobItems.forEach(item => {
                    item.classList.remove('hajl-highlight');
                    item.style.background = '';
                    item.style.border = '';
                    item.style.boxShadow = '';
                    item.style.display = '';

                    if (mode === 'none') return;

                    let wasMatched = false;

                    if (isApplied(item)) {
                        appliedJobsHidden++;
                        wasMatched = true;
                    }

                    const itemText = item.textContent;
                    keywords.forEach(keyword => {
                        const matches = caseInsensitive
                            ? itemText.toLowerCase().includes(keyword.toLowerCase())
                            : itemText.includes(keyword);
                        if (matches) {
                            keywordMatches[keyword]++;
                            wasMatched = true;
                        }
                    });

                    if (wasMatched) {
                        if (mode === 'hide') {
                            item.style.display = 'none';
                        } else if (mode === 'highlight') {
                            item.classList.add('hajl-highlight');
                            item.style.background = highlightColor;
                            item.style.border = `2px solid ${highlightColor}`;
                            item.style.boxShadow = `0 0 8px ${hexToRgba(highlightColor, 0.55)}`;
                        }
                    }
                });

                let logMessage = `${chrome.runtime.getManifest().name}: `;
                if (mode === 'none') {
                    logMessage += `No action taken on jobs.`;
                } else {
                    logMessage += `${mode === 'hide' ? 'Hidden' : 'Highlighted'} ${appliedJobsHidden} jobs you've applied to`;
                    const totalKeywordMatches = Object.values(keywordMatches).reduce((a, b) => a + b, 0);
                    if (totalKeywordMatches > 0) {
                        logMessage += `, and ${totalKeywordMatches} jobs matching keywords:`;
                        Object.entries(keywordMatches).forEach(([keyword, count]) => {
                            if (count > 0) logMessage += `\n- "${keyword}": ${count} jobs`;
                        });
                    }
                }
                console.log(logMessage);
            }
        );
    }

    hideJobItems();

    let debounceTimer = null;
    const observer = new MutationObserver(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            hideJobItems();
        }, OBSERVER_DEBOUNCE_MS);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    let lastUrl = location.href;
    function scheduleHideAfterNav() {
        setTimeout(() => {
            hideJobItems();
        }, NAV_ROUTE_DELAY_MS);
    }

    const navObserver = new MutationObserver(() => {
        const href = location.href;
        if (href !== lastUrl) {
            lastUrl = href;
            scheduleHideAfterNav();
        }
    });
    navObserver.observe(document, { subtree: true, childList: true });

    window.addEventListener('popstate', () => {
        const href = location.href;
        if (href !== lastUrl) {
            lastUrl = href;
            scheduleHideAfterNav();
        }
    });
}

function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
        c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

init();
