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

// Returns one element per job card, supporting three LinkedIn layouts:
//
//  1. Legacy BEM layout  — .jobs-search-results__list-item / .scaffold-layout__list-item
//  2. New /jobs/search-results/ layout — [role="button"][componentkey^="job-card-component-ref-"]
//  3. Older layout — div[role="button"][componentkey] with UUID keys
export function getJobItems(document_ = document) {
	const legacy = Array.from(document_.querySelectorAll(
		'.jobs-search-results__list-item, .scaffold-layout__list-item',
	));
	if (legacy.length > 0) {
		return legacy;
	}

	const byJobCardReference = Array.from(document_.querySelectorAll(
		'[role="button"][componentkey^="job-card-component-ref-"]',
	));
	if (byJobCardReference.length > 0) {
		return byJobCardReference;
	}

	const scope
		= document_.querySelector('[data-testid="lazy-column"]')
		?? document_.querySelector('#workspace')
		?? document_.querySelector('main')
		?? document_.body;

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

export function isApplied(item) {
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

export function buildLogMessage({
	extensionName,
	mode,
	matchApplied,
	matchKeywords,
	appliedJobsHidden,
	keywordMatches,
	keywords,
}) {
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

export function parseKeywords(keywordsString) {
	return keywordsString
		? keywordsString.split(',').map(k => k.trim()).filter(Boolean)
		: [];
}

export function applyJobActions(jobItems, settings) {
	const {
		keywords,
		caseInsensitive,
		matchApplied,
		matchKeywords,
		mode,
	} = settings;

	const keywordMatches = {};
	for (const keyword of keywords) {
		keywordMatches[keyword] = 0;
	}

	if (mode === 'none') {
		return {
			matchedCount: 0,
			appliedJobsHidden: 0,
			keywordMatches,
			matchedItems: [],
		};
	}

	let appliedJobsHidden = 0;
	let matchedCount = 0;
	const matchedItems = [];

	for (const item of jobItems) {
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
			matchedItems.push(item);
		}
	}

	return {
		matchedCount,
		appliedJobsHidden,
		keywordMatches,
		matchedItems,
	};
}
