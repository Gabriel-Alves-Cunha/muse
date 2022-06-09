import { vi } from "vitest";

export const mockGlobalsBeforeTests = () => {
	// Mocking `window.electron` before importing code that calls it:
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

	vi.stubGlobal("localStorage", new LocalStorageMock());

	// Mocking window.document
	vi.stubGlobal("document", {
		getElementById: vi.fn().mockImplementation(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			(_elementId: string) => ({ loop: true } as HTMLAudioElement),
		),
	});
};
