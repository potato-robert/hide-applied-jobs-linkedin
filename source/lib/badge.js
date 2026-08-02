export function formatBadgeText(count) {
	if (count === 0) {
		return '';
	}

	if (count > 99) {
		return '99+';
	}

	return String(count);
}
