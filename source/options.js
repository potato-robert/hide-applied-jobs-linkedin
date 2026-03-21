// Saves options to chrome.storage
const saveOptions = () => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const caseInsensitiveChecked = document.getElementById('caseInsensitiveToggle').checked;
    const keywords = document.getElementById('keywords').value;
    const highlightColor = document.getElementById('highlightColor').value;

    chrome.storage.sync.set(
        { mode: mode, caseInsensitive: caseInsensitiveChecked, keywords: keywords, highlightColor: highlightColor },
        () => {
            const status = document.getElementById('status');
            status.textContent = 'Options saved. Refresh the page to see changes.';
            setTimeout(() => {
                status.textContent = '';
            }, 3000);
        }
    );
};

// Restores select box and checkbox state using the preferences stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        { mode: 'hide', caseInsensitive: true, keywords: '', highlightColor: '#ffeaea' },
        (items) => {
            document.getElementById('modeNone').checked = items.mode === 'none';
            document.getElementById('modeHide').checked = items.mode === 'hide';
            document.getElementById('modeHighlight').checked = items.mode === 'highlight';
            document.getElementById('caseInsensitiveToggle').checked = items.caseInsensitive;
            document.getElementById('keywords').value = items.keywords;
            document.getElementById('highlightColor').value = items.highlightColor || '#ffeaea';
            updateFieldStates(items.mode);
            document.getElementById('highlightColorRow').style.display = items.mode === 'highlight' ? 'flex' : 'none';
        }
    );
};

// Updates the disabled state of fields based on the selected mode
const updateFieldStates = (mode) => {
    const disable = mode === 'none';
    document.getElementById('caseInsensitiveToggle').disabled = disable;
    document.getElementById('keywords').disabled = disable;
    document.getElementById('highlightColor').disabled = disable || document.querySelector('input[name="mode"]:checked').value !== 'highlight';
    // Add visual feedback for disabled state
    const disabledElements = document.querySelectorAll('#caseInsensitiveToggle, #keywords, #highlightColor');
    disabledElements.forEach(element => {
        element.style.opacity = element.disabled ? '0.5' : '1';
    });
};

// Show/hide color picker based on mode
const updateHighlightColorVisibility = () => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    document.getElementById('highlightColorRow').style.display = mode === 'highlight' ? 'flex' : 'none';
    updateFieldStates(mode);
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('modeNone').addEventListener('change', updateHighlightColorVisibility);
document.getElementById('modeHide').addEventListener('change', updateHighlightColorVisibility);
document.getElementById('modeHighlight').addEventListener('change', updateHighlightColorVisibility);