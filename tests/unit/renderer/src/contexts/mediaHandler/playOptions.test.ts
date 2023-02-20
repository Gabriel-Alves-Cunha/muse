import { describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import {
	toggleLoopMedia,
	toggleRandom,
	playOptions,
} from "@contexts/playOptions";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing usePlayOptions", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get a new playOptions with .loopThisMedia set", () => {
		playOptions.loopThisMedia = true;

		expect(
			playOptions,
			"playOptions should have { loopThisMedia: true }!",
		).toHaveProperty("loopThisMedia", true);

		toggleLoopMedia();

		expect(
			playOptions,
			"playOptions should have { loopThisMedia: false }!",
		).toHaveProperty("loopThisMedia", false);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get a new playOptions with .isRandom set", () => {
		playOptions.isRandom = true;

		expect(
			playOptions,
			"playOptions should have { isRandom: true }!",
		).toHaveProperty("isRandom", true);

		toggleRandom();

		expect(
			playOptions,
			"playOptions should have { isRandom: true }!",
		).toHaveProperty("isRandom", false);
	});
});
