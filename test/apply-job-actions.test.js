import {describe, expect, it} from 'vitest';
import {applyJobActions} from '../source/lib/job-matching.js';

function createJobItem(innerHtml) {
	const item = document.createElement('div');
	item.innerHTML = innerHtml;
	return item;
}

describe('applyJobActions', () => {
	it('returns no matches in none mode', () => {
		const items = [createJobItem('<span>Software Engineer</span><span>Applied</span>')];
		const result = applyJobActions(items, {
			keywords: [],
			caseInsensitive: true,
			matchApplied: true,
			matchKeywords: true,
			mode: 'none',
		});

		expect(result.matchedCount).toBe(0);
		expect(result.matchedItems).toEqual([]);
	});

	it('matches applied jobs in hide mode', () => {
		const applied = createJobItem('<span>Software Engineer</span><span>Applied</span>');
		const open = createJobItem('<span>Product Manager</span><span>Remote</span>');
		const result = applyJobActions([applied, open], {
			keywords: [],
			caseInsensitive: true,
			matchApplied: true,
			matchKeywords: false,
			mode: 'hide',
		});

		expect(result.matchedCount).toBe(1);
		expect(result.appliedJobsHidden).toBe(1);
		expect(result.matchedItems).toEqual([applied]);
	});

	it('matches keywords case-insensitively', () => {
		const promoted = createJobItem('Senior Engineer PROMOTED role');
		const remote = createJobItem('Backend Developer onsite');
		const result = applyJobActions([promoted, remote], {
			keywords: ['promoted', 'remote'],
			caseInsensitive: true,
			matchApplied: false,
			matchKeywords: true,
			mode: 'highlight',
		});

		expect(result.matchedCount).toBe(1);
		expect(result.keywordMatches.promoted).toBe(1);
		expect(result.keywordMatches.remote).toBe(0);
		expect(result.matchedItems).toEqual([promoted]);
	});

	it('matches keywords case-sensitively when configured', () => {
		const item = createJobItem('Remote work available');
		const result = applyJobActions([item], {
			keywords: ['remote'],
			caseInsensitive: false,
			matchApplied: false,
			matchKeywords: true,
			mode: 'hide',
		});

		expect(result.matchedCount).toBe(0);

		const exact = createJobItem('remote position');
		const exactResult = applyJobActions([exact], {
			keywords: ['remote'],
			caseInsensitive: false,
			matchApplied: false,
			matchKeywords: true,
			mode: 'hide',
		});

		expect(exactResult.matchedCount).toBe(1);
	});

	it('combines applied and keyword matching', () => {
		const applied = createJobItem('<span>Engineer role</span><span>Applied</span>');
		const promoted = createJobItem('<span>Promoted listing</span>');
		const plain = createJobItem('<span>Regular job</span>');
		const result = applyJobActions([applied, promoted, plain], {
			keywords: ['Promoted'],
			caseInsensitive: true,
			matchApplied: true,
			matchKeywords: true,
			mode: 'hide',
		});

		expect(result.matchedCount).toBe(2);
		expect(result.appliedJobsHidden).toBe(1);
		expect(result.keywordMatches.Promoted).toBe(1);
		expect(result.matchedItems).toEqual([applied, promoted]);
	});
});
