import { vi } from "vitest";

import { getObjectLength, withoutProperty } from "@utils/object";
import { stringifyJson } from "@common/utils";

const { log } = console;

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

		const keys = Object.keys(this.#store);
		return keys[index] || null;
	}

	getItem(key: string) {
		return this.#store[key] ?? null;
	}

	setItem(key: string, value: string) {
		this.#store[key] = value;
	}

	removeItem(key: string) {
		this.#store = withoutProperty(this.#store, key);
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
		getElementById: vi
			.fn()
			.mockImplementation(
				(_elementId: string) => ({ loop: true }) as HTMLAudioElement,
			),
		// createElement: vi.fn(),
	});

	vi.stubGlobal("window", {
		postMessage: vi.fn().mockImplementation(function (...args: unknown[]) {
			log(
				"%cwindow.postMessage arguments =",
				"color:blue",
				stringifyJson(args),
			);
		}),
		requestAnimationFrame: vi.fn().mockImplementation((cb: () => void) => cb()),
		getElementById: vi.fn(),
		createElement: vi.fn(),
	});
}
