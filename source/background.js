import {formatBadgeText} from './lib/badge.js';

const BADGE_COLOR = '#4d6d8c';
const LINKEDIN_HOST = 'www.linkedin.com';

function setBadgeForTab(tabId, count) {
	const text = formatBadgeText(count);

	try {
		chrome.action.setBadgeText({text, tabId});
		if (count > 0) {
			chrome.action.setBadgeBackgroundColor({color: BADGE_COLOR, tabId});
		}
	} catch {
		// Tab may have closed before the badge update completed.
	}
}

chrome.runtime.onMessage.addListener((message, sender) => {
	if (message?.type !== 'HAJL_MATCH_COUNT') {
		return;
	}

	const tabId = sender.tab?.id;
	if (tabId === undefined) {
		return;
	}

	const {count} = message;
	if (typeof count !== 'number' || count < 0 || !Number.isFinite(count)) {
		return;
	}

	setBadgeForTab(tabId, count);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (!changeInfo.url) {
		return;
	}

	try {
		const {hostname} = new URL(changeInfo.url);
		if (hostname !== LINKEDIN_HOST) {
			setBadgeForTab(tabId, 0);
		}
	} catch {
		setBadgeForTab(tabId, 0);
	}
});
