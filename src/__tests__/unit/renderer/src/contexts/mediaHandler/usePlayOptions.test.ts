import { describe, expect, it, vi } from "vitest";

// Mocking `global.electron` before importing code that calls it:
global.electron = {
	notificationApi: {
		receiveMsgFromElectron: vi.fn(),
	},
	fs: {
		getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
		readdir: vi.fn(),
		readFile: vi.fn(),
		deleteFile: vi.fn(),
	},
	os: {
		homeDir: "test/homeDir",
		dirs: {
			documents: "test/documents",
			downloads: "test/downloads",
			music: "test/music",
		},
	},
	media: {
		transformPathsToMedias: vi.fn(),
		convertToAudio: vi.fn(),
		writeTags: vi.fn(),
		getBasicInfo: vi.fn(),
	},
};

// Mocking global.localStorage
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

global.localStorage = new LocalStorageMock();

global.document = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getElementById(_elementId: string) {
		return { loop: true } as HTMLAudioElement;
	},
} as unknown as Document;

import { PlayOptionsType, usePlayOptions } from "@contexts";

const { getState: getPlayOptions } = usePlayOptions;

describe("Testing usePlayOptions", () => {
	it("should get a new playOptions with .loopThisMedia set", () => {
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.LOOP_THIS_MEDIA,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopThisMedia", true);
		}
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.LOOP_THIS_MEDIA,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopThisMedia", false);
		}
	});

	it("should get a new playOptions with .loopAllMedia set", () => {
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.LOOP_ALL_MEDIA,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopAllMedia", true);
		}
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.LOOP_ALL_MEDIA,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopAllMedia", false);
		}
	});

	it("should get a new playOptions with .isRandom set", () => {
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.IS_RANDOM,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("isRandom", true);
		}
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.IS_RANDOM,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("isRandom", false);
		}
	});
});
