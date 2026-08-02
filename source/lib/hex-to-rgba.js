export function hexToRgba(hex, alpha) {
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
