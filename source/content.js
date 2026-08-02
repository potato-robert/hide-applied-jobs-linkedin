import {DEFAULT_SETTINGS} from './lib/defaults.js';
import {hexToRgba} from './lib/hex-to-rgba.js';
import {
	applyJobActions,
	buildLogMessage,
	getJobItems,
	parseKeywords,
} from './lib/job-matching.js';

const OBSERVER_DEBOUNCE_MS = 300;
const NAV_ROUTE_DELAY_MS = 800;

function resetJobItemStyles(item) {
	item.classList.remove('hajl-highlight');
	item.style.background = '';
	item.style.border = '';
	item.style.boxShadow = '';
	item.style.display = '';
}

function applyMatchStyles(item, mode, highlightColor) {
	if (mode === 'hide') {
		item.style.display = 'none';
	} else if (mode === 'highlight') {
		item.classList.add('hajl-highlight');
		item.style.background = highlightColor;
		item.style.border = `2px solid ${highlightColor}`;
		item.style.boxShadow = `0 0 8px ${hexToRgba(highlightColor, 0.55)}`;
	}
}

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

	function hideJobItems() {
		const runId = ++hideRunId;
		const jobItems = getJobItems();
		if (jobItems.length === 0) {
			reportMatchCount(0, runId);
			console.log(`${chrome.runtime.getManifest().name}: No job cards found on this page.`);
			return;
		}

		chrome.storage.sync.get(DEFAULT_SETTINGS, result => {
			if (runId !== hideRunId) {
				return;
			}

			const keywords = parseKeywords(result.keywords);
			const caseInsensitive = result.caseInsensitive ?? true;
			const matchApplied = result.matchApplied ?? true;
			const matchKeywords = result.matchKeywords ?? true;
			const mode = result.mode || 'none';
			const highlightColor = result.highlightColor || DEFAULT_SETTINGS.highlightColor;

			for (const item of jobItems) {
				resetJobItemStyles(item);
			}

			const {matchedCount, appliedJobsHidden, keywordMatches, matchedItems} = applyJobActions(
				jobItems,
				{
					keywords,
					caseInsensitive,
					matchApplied,
					matchKeywords,
					mode,
				},
			);

			for (const item of matchedItems) {
				applyMatchStyles(item, mode, highlightColor);
			}

			reportMatchCount(matchedCount, runId);
			console.log(buildLogMessage({
				extensionName: chrome.runtime.getManifest().name,
				mode,
				matchApplied,
				matchKeywords,
				appliedJobsHidden,
				keywordMatches,
				keywords,
			}));
		});
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

init();
