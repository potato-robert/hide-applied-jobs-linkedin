import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
	beforeEach, describe, expect, it,
} from 'vitest';
import {getJobItems} from '../source/lib/job-matching.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name) {
	const html = readFileSync(join(__dirname, 'fixtures', name), 'utf8');
	document.body.innerHTML = html;
}

describe('getJobItems', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('returns legacy BEM layout items', () => {
		loadFixture('legacy-bem.html');
		const items = getJobItems();
		expect(items).toHaveLength(2);
		expect(items[0].classList.contains('jobs-search-results__list-item')).toBe(true);
	});

	it('returns job-card-ref layout items', () => {
		loadFixture('job-card-ref.html');
		const items = getJobItems();
		expect(items).toHaveLength(2);
		expect(items[0].getAttribute('componentkey')).toMatch(/^job-card-component-ref-/);
	});

	it('returns UUID layout items and ignores invalid keys', () => {
		loadFixture('uuid-layout.html');
		const items = getJobItems();
		expect(items).toHaveLength(2);
	});

	it('returns empty array when no job cards exist', () => {
		document.body.innerHTML = '<div>No jobs here</div>';
		expect(getJobItems()).toEqual([]);
	});
});
