import { vi } from "vitest";

import { stringifyJson } from "@common/utils";
import { getObjectLength } from "@utils/object";

// Mocking window.localStorage
class LocalStorageMock {
	#store: Record<string, string>;

	constructor() {
		this.#store = {};
	}

	get length() {
		return getObjectLength(this.#store);
	}

	clear() {
		this.#store = {};
	}

	key(index: number): string | null {
		if (index > this.length) return null;

		return this.#store[index];
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
			readDir: vi.fn(),
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
		postMessage: vi.fn().mockImplementation(function() {
			console.log(
				"%cwindow.postMessage arguments =",
				"color:blue",
				// eslint-disable-next-line prefer-rest-params
				stringifyJson(arguments),
			);
		}),
		requestAnimationFrame: vi.fn().mockImplementation((cb: () => void) => cb()),
		getElementById: vi.fn(),
		createElement: vi.fn(),
	});
}
