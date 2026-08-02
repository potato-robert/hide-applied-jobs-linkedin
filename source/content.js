const OBSERVER_DEBOUNCE_MS = 300;
const NAV_ROUTE_DELAY_MS = 800;

function init() {
	let hideRunId = 0;
	let lastReportedCount = -1;

	function reportMatchCount(count, runId) {
		if (runId !== hideRunId || count === lastReportedCount) {
			return;
		}

		lastReportedCount = count;
		chrome.runtime.sendMessage({type: 'HAJL_MATCH_COUNT', count}, () => {
			if (chrome.runtime.lastError) {
				// Service worker may be unavailable.
			}
		});
	}

	function buildLogMessage(mode, matchApplied, matchKeywords, appliedJobsHidden, keywordMatches, keywords) {
		const extensionName = chrome.runtime.getManifest().name;
		if (mode === 'none') {
			return `${extensionName}: No action taken on jobs.`;
		}

		if (!matchApplied && !matchKeywords) {
			return `${extensionName}: No matching criteria selected.`;
		}

		const actionLabel = mode === 'hide' ? 'Hidden' : 'Highlighted';
		const totalKeywordMatches = Object.values(keywordMatches).reduce((a, b) => a + b, 0);
		let logMessage = `${extensionName}: `;

		if (matchApplied) {
			logMessage += `${actionLabel} ${appliedJobsHidden} jobs you've applied to`;
		}

		if (matchKeywords) {
			if (keywords.length === 0) {
				logMessage += matchApplied
					? ', keyword matching enabled but no keywords configured'
					: 'Keyword matching enabled but no keywords configured';
			} else {
				logMessage += matchApplied
					? `, and ${totalKeywordMatches} jobs matching keywords:`
					: `${actionLabel} ${totalKeywordMatches} jobs matching keywords:`;
				for (const keyword of keywords) {
					const count = keywordMatches[keyword] ?? 0;
					logMessage += `\n- "${keyword}": ${count} jobs`;
				}
			}
		}

		return logMessage;
	}

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
			'.jobs-search-results__list-item, .scaffold-layout__list-item',
		));
		if (legacy.length > 0) {
			return legacy;
		}

		const byJobCardReference = Array.from(document.querySelectorAll(
			'[role="button"][componentkey^="job-card-component-ref-"]',
		));
		if (byJobCardReference.length > 0) {
			return byJobCardReference;
		}

		const scope
            = document.querySelector('[data-testid="lazy-column"]')
            ?? document.querySelector('#workspace')
            ?? document.querySelector('main')
            ?? document.body;

		const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
		const seen = new Set();
		const byUuid = Array.from(scope.querySelectorAll('[role="button"][componentkey]'))
			.filter(element => {
				const key = element.getAttribute('componentkey');
				if (!key || !uuidPattern.test(key)) {
					return false;
				}

				if (seen.has(key)) {
					return false;
				}

				seen.add(key);
				return true;
			});
		if (byUuid.length > 0) {
			return byUuid;
		}

		return [];
	}

	// ---------------------------------------------------------------------------
	// isApplied(item)
	// ---------------------------------------------------------------------------
	const appliedTranslations = [
		'Applied', // English
		'Solicitados', // Spanish
		'Candidature envoyée', // French
		'Beworben', // German
		'Candidatura inviata', // Italian
		'Candidatura enviada', // Portuguese
		'Sollicitatie verzonden', // Dutch
		'Ansökt', // Swedish
		'Søgt', // Danish
		'Søkt', // Norwegian
		'Haettu', // Finnish
		'Zaaplikowano', // Polish
		'Přihlášeno', // Czech
		'Jelentkezett', // Hungarian
	];
	const appliedSet = new Set(appliedTranslations.map(t => t.toLowerCase()));

	function isApplied(item) {
		const textMatch = Array.from(item.querySelectorAll('li, p, span, div')).some(element => {
			const text = element.textContent.trim();
			return appliedSet.has(text.toLowerCase());
		});
		if (textMatch) {
			return true;
		}

		const ariaMatch = Array.from(item.querySelectorAll('[aria-label]')).some(element => {
			const label = element.getAttribute('aria-label');
			if (!label) {
				return false;
			}

			const lower = label.toLowerCase();
			return appliedTranslations.some(t => lower.includes(t.toLowerCase()));
		});
		if (ariaMatch) {
			return true;
		}

		return Boolean(item.querySelector('[class*="applied" i]'));
	}

	// ---------------------------------------------------------------------------
	// hideJobItems()
	// ---------------------------------------------------------------------------
	function hideJobItems() {
		const runId = ++hideRunId;
		const jobItems = getJobItems();
		if (jobItems.length === 0) {
			reportMatchCount(0, runId);
			console.log(`${chrome.runtime.getManifest().name}: No job cards found on this page.`);
			return;
		}

		let appliedJobsHidden = 0;
		let matchedCount = 0;
		const keywordMatches = {};

		// Defaults must match options.js restoreOptions() so UI and runtime stay aligned
		chrome.storage.sync.get(
			{
				keywords: '',
				caseInsensitive: true,
				matchApplied: true,
				matchKeywords: true,
				mode: 'hide',
				highlightColor: '#ffeaea',
			},
			result => {
				if (runId !== hideRunId) {
					return;
				}

				const keywords = result.keywords
					? result.keywords.split(',').map(k => k.trim()).filter(Boolean)
					: [];
				const caseInsensitive = result.caseInsensitive ?? true;
				const matchApplied = result.matchApplied ?? true;
				const matchKeywords = result.matchKeywords ?? true;
				const mode = result.mode || 'none';
				const highlightColor = result.highlightColor || '#ffeaea';

				for (const keyword of keywords) {
					keywordMatches[keyword] = 0;
				}

				for (const item of jobItems) {
					item.classList.remove('hajl-highlight');
					item.style.background = '';
					item.style.border = '';
					item.style.boxShadow = '';
					item.style.display = '';

					if (mode === 'none') {
						continue;
					}

					let wasMatched = false;

					if (matchApplied && isApplied(item)) {
						appliedJobsHidden++;
						wasMatched = true;
					}

					if (matchKeywords && keywords.length > 0) {
						const itemText = item.textContent;
						for (const keyword of keywords) {
							const matches = caseInsensitive
								? itemText.toLowerCase().includes(keyword.toLowerCase())
								: itemText.includes(keyword);
							if (matches) {
								keywordMatches[keyword]++;
								wasMatched = true;
							}
						}
					}

					if (wasMatched) {
						matchedCount++;
						if (mode === 'hide') {
							item.style.display = 'none';
						} else if (mode === 'highlight') {
							item.classList.add('hajl-highlight');
							item.style.background = highlightColor;
							item.style.border = `2px solid ${highlightColor}`;
							item.style.boxShadow = `0 0 8px ${hexToRgba(highlightColor, 0.55)}`;
						}
					}
				}

				reportMatchCount(matchedCount, runId);
				console.log(buildLogMessage(mode, matchApplied, matchKeywords, appliedJobsHidden, keywordMatches, keywords));
			},
		);
	}

	hideJobItems();

	let debounceTimer = null;
	const observer = new MutationObserver(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			hideJobItems();
		}, OBSERVER_DEBOUNCE_MS);
	});
	observer.observe(document.body, {childList: true, subtree: true});

	let lastUrl = location.href;
	function scheduleHideAfterNavigation() {
		setTimeout(() => {
			hideJobItems();
		}, NAV_ROUTE_DELAY_MS);
	}

	const navigationObserver = new MutationObserver(() => {
		const href = location.href;
		if (href !== lastUrl) {
			lastUrl = href;
			scheduleHideAfterNavigation();
		}
	});
	navigationObserver.observe(document, {subtree: true, childList: true});

	window.addEventListener('popstate', () => {
		const href = location.href;
		if (href !== lastUrl) {
			lastUrl = href;
			scheduleHideAfterNavigation();
		}
	});
}

function hexToRgba(hex, alpha) {
	let c = hex.replace('#', '');
	if (c.length === 3) {
		c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
	}

	const number_ = Number.parseInt(c, 16);
	const r = Math.floor(number_ / 65_536) % 256;
	const g = Math.floor(number_ / 256) % 256;
	const b = number_ % 256;
	return `rgba(${r},${g},${b},${alpha})`;
}

init();
