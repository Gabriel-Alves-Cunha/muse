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

	it("should get playOptions with 'loopThisMedia' set", () => {
		playOptions.loopThisMedia = true;

		expect(
			playOptions.loopThisMedia,
			"playOptions.loopThisMedia should be true.",
		).toBe(true);

		toggleLoopMedia();

		expect(
			playOptions.loopThisMedia,
			"playOptions.loopThisMedia should be false.",
		).toBe(false);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get playOptions with .isRandom set", () => {
		playOptions.isRandom = true;

		expect(playOptions.isRandom, "playOptions.isRandom should be true.").toBe(
			true,
		);

		toggleRandom();

		expect(playOptions.isRandom, "playOptions.isRandom should be true.").toBe(
			false,
		);
	});
});
