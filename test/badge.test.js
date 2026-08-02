import {describe, expect, it} from 'vitest';
import {formatBadgeText} from '../source/lib/badge.js';

describe('formatBadgeText', () => {
	it('returns empty string for zero', () => {
		expect(formatBadgeText(0)).toBe('');
	});

	it('returns string count for 1-99', () => {
		expect(formatBadgeText(1)).toBe('1');
		expect(formatBadgeText(42)).toBe('42');
		expect(formatBadgeText(99)).toBe('99');
	});

	it('returns 99+ for counts over 99', () => {
		expect(formatBadgeText(100)).toBe('99+');
		expect(formatBadgeText(500)).toBe('99+');
	});
});
