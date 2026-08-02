const getMode = () => document.querySelector('input[name="mode"]:checked').value;

// Saves options to chrome.storage
const saveOptions = () => {
	const mode = getMode();
	const matchApplied = document.querySelector('#matchAppliedToggle').checked;
	const matchKeywords = document.querySelector('#matchKeywordsToggle').checked;
	const caseInsensitive = document.querySelector('#caseInsensitiveToggle').checked;
	const keywords = document.querySelector('#keywords').value;
	const highlightColor = document.querySelector('#highlightColor').value;

	chrome.storage.sync.set(
		{
			mode,
			matchApplied,
			matchKeywords,
			caseInsensitive,
			keywords,
			highlightColor,
		},
		() => {
			const status = document.querySelector('#status');
			status.textContent = 'Options saved. Refresh the page to see changes.';
			setTimeout(() => {
				status.textContent = '';
			}, 3000);
		},
	);
};

// Restores select box and checkbox state using the preferences stored in chrome.storage.
const restoreOptions = () => {
	chrome.storage.sync.get(
		{
			mode: 'hide',
			matchApplied: true,
			matchKeywords: true,
			caseInsensitive: true,
			keywords: '',
			highlightColor: '#ffeaea',
		},
		items => {
			document.querySelector('#modeNone').checked = items.mode === 'none';
			document.querySelector('#modeHide').checked = items.mode === 'hide';
			document.querySelector('#modeHighlight').checked = items.mode === 'highlight';
			document.querySelector('#matchAppliedToggle').checked = items.matchApplied;
			document.querySelector('#matchKeywordsToggle').checked = items.matchKeywords;
			document.querySelector('#caseInsensitiveToggle').checked = items.caseInsensitive;
			document.querySelector('#keywords').value = items.keywords;
			document.querySelector('#highlightColor').value = items.highlightColor || '#ffeaea';
			updateFieldStates();
		},
	);
};

const updateFieldStates = () => {
	const mode = getMode();
	const matchApplied = document.querySelector('#matchAppliedToggle').checked;
	const matchKeywords = document.querySelector('#matchKeywordsToggle').checked;
	const noAction = mode === 'none';
	const highlightMode = mode === 'highlight';
	const noMatchCriteria = !noAction && !matchApplied && !matchKeywords;

	document.querySelector('#matchAppliedToggle').disabled = noAction;
	document.querySelector('#matchKeywordsToggle').disabled = noAction;
	document.querySelector('#caseInsensitiveToggle').disabled = noAction || !matchKeywords;
	document.querySelector('#keywords').disabled = noAction || !matchKeywords;
	document.querySelector('#highlightColor').disabled = !highlightMode;

	document.querySelector('#highlightColorRow').hidden = !highlightMode;
	document.querySelector('#noMatchWarning').hidden = !noMatchCriteria;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);
for (const input of document.querySelectorAll('input[name="mode"]')) {
	input.addEventListener('change', updateFieldStates);
}

document.querySelector('#matchAppliedToggle').addEventListener('change', updateFieldStates);
document.querySelector('#matchKeywordsToggle').addEventListener('change', updateFieldStates);
