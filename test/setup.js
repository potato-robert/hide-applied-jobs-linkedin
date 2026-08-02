import {vi} from 'vitest';

globalThis.chrome = {
	runtime: {
		getManifest: () => ({name: 'Hide Applied Jobs LinkedIn'}),
		sendMessage: vi.fn((message, callback) => {
			callback?.();
		}),
		lastError: null,
	},
	storage: {
		sync: {
			get: vi.fn(),
			set: vi.fn(),
		},
	},
	action: {
		setBadgeText: vi.fn(),
		setBadgeBackgroundColor: vi.fn(),
	},
};
