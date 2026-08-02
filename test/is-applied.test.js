import {describe, expect, it} from 'vitest';
import {isApplied} from '../source/lib/job-matching.js';

describe('isApplied', () => {
	it('detects English "Applied" text', () => {
		const item = document.createElement('div');
		item.innerHTML = '<span>Software Engineer</span><span>Applied</span>';
		expect(isApplied(item)).toBe(true);
	});

	it('detects French applied label', () => {
		const item = document.createElement('div');
		item.innerHTML = '<span>Développeur</span><span>Candidature envoyée</span>';
		expect(isApplied(item)).toBe(true);
	});

	it('detects applied status via aria-label', () => {
		const item = document.createElement('div');
		item.innerHTML = '<span aria-label="Status: Applied">Job</span>';
		expect(isApplied(item)).toBe(true);
	});

	it('detects applied status via class selector', () => {
		const item = document.createElement('div');
		item.innerHTML = '<span class="job-card-applied-badge">Applied</span>';
		expect(isApplied(item)).toBe(true);
	});

	it('returns false for non-applied jobs', () => {
		const item = document.createElement('div');
		item.innerHTML = '<span>Software Engineer</span><span>Be an early applicant</span>';
		expect(isApplied(item)).toBe(false);
	});
});
