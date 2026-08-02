import {describe, expect, it} from 'vitest';
import {hexToRgba} from '../source/lib/hex-to-rgba.js';

describe('hexToRgba', () => {
	it('converts 6-digit hex', () => {
		expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
	});

	it('converts 3-digit hex', () => {
		expect(hexToRgba('#f00', 1)).toBe('rgba(255,0,0,1)');
	});

	it('converts highlight color default', () => {
		expect(hexToRgba('#ffeaea', 0.55)).toBe('rgba(255,234,234,0.55)');
	});
});
