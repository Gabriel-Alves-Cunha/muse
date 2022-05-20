import { describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import {
	toggleLoopMedia,
	setPlayOptions,
	playOptions,
} from "@contexts/mediaHandler/usePlayOptions";

describe("Testing usePlayOptions", () => {
	it("should get a new playOptions with .loopThisMedia set", () => {
		setPlayOptions({ loopThisMedia: true });
		expect(playOptions()).toHaveProperty("loopThisMedia", true);

		toggleLoopMedia();
		expect(playOptions()).toHaveProperty("loopThisMedia", false);
	});

	it("should get a new playOptions with .isRandom set", () => {
		setPlayOptions({ isRandom: true });
		expect(playOptions()).toHaveProperty("isRandom", true);

		setPlayOptions({ isRandom: false });
		expect(playOptions()).toHaveProperty("isRandom", false);
	});
});
