import { describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import {
	toggleLoopMedia,
	getPlayOptions,
	setPlayOptions,
	toggleRandom,
} from "@contexts/playOptions";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing usePlayOptions", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get playOptions with 'loopThisMedia' set", () => {
		setPlayOptions({ loopThisMedia: true });

		expect(
			getPlayOptions().loopThisMedia,
			"playOptions.loopThisMedia should be true.",
		).toBe(true);

		toggleLoopMedia();

		expect(
			getPlayOptions().loopThisMedia,
			"playOptions.loopThisMedia should be false.",
		).toBe(false);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get playOptions with .isRandom set", () => {
		setPlayOptions({ isRandom: true });

		expect(
			getPlayOptions().isRandom,
			"playOptions.isRandom should be true.",
		).toBe(true);

		toggleRandom();

		expect(
			getPlayOptions().isRandom,
			"playOptions.isRandom should be true.",
		).toBe(false);
	});
});
