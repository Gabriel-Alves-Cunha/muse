import { vi } from "vitest";

// Mocking window.localStorage
class LocalStorageMock {
	#store: Record<string, string>;

	constructor() {
		this.#store = {};
	}

	get length() {
		return Object.keys(this.#store).length;
	}

	clear() {
		this.#store = {};
	}

	key(index: number): string | null {
		const keys = Object.keys(this.#store);

		if (index > keys.length) return null;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return keys[index]!;
	}

	getItem(key: string) {
		return this.#store[key] ?? null;
	}

	setItem(key: string, value: string) {
		this.#store[key] = String(value);
	}

	removeItem(key: string) {
		delete this.#store[key];
	}
}

export function mockElectronPlusNodeGlobalsBeforeTests() {
	// Mocking window
	vi.stubGlobal("electron", {
		notificationApi: { sendNotificationToElectronIpcMainProcess: vi.fn() },
		fs: {
			getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
			deleteFile: vi.fn(),
			readFile: vi.fn(),
			readdir: vi.fn(),
		},
		os: {
			dirs: {
				documents: "test/documents",
				downloads: "test/downloads",
				music: "test/music",
			},
		},
		media: { transformPathsToMedias: vi.fn(), getBasicInfo: vi.fn() },
	});

	vi.stubGlobal("localStorage", new LocalStorageMock());

	vi.stubGlobal("document", {
		getElementById: vi.fn().mockImplementation(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			(_elementId: string) => ({ loop: true } as HTMLAudioElement),
		),
		// createElement: vi.fn(),
	});

	vi.stubGlobal("window", {
		postMessage: vi
			.fn() // eslint-disable-next-line @typescript-eslint/no-explicit-any
			.mockImplementation(function() {
				console.log(
					"%cwindow.postMessage arguments =",
					"color:blue",
					// eslint-disable-next-line prefer-rest-params
					JSON.stringify(arguments, null, 2),
				);
			}),
		requestAnimationFrame: vi.fn(),
		getElementById: vi.fn(),
		createElement: vi.fn(),
	});
}
