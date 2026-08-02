import {describe, expect, it} from 'vitest';
import {DEFAULT_SETTINGS} from '../source/lib/defaults.js';

describe('DEFAULT_SETTINGS', () => {
	it('includes all options UI fields', () => {
		expect(DEFAULT_SETTINGS).toEqual({
			keywords: '',
			caseInsensitive: true,
			matchApplied: true,
			matchKeywords: true,
			mode: 'hide',
			highlightColor: '#ffeaea',
		});
	});

	it('matches options.html default mode', () => {
		expect(DEFAULT_SETTINGS.mode).toBe('hide');
	});
});
