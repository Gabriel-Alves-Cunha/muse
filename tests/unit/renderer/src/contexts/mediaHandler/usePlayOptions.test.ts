import { describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

const { getPlayOptions, setPlayOptions, toggleLoopMedia } = await import(
	"@contexts/usePlayOptions"
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing usePlayOptions", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get a new playOptions with .loopThisMedia set", () => {
		setPlayOptions({ loopThisMedia: true });

		expect(
			getPlayOptions(),
			"playOptions should have { loopThisMedia: true }!",
		).toHaveProperty("loopThisMedia", true);

		toggleLoopMedia();

		expect(
			getPlayOptions(),
			"playOptions should have { loopThisMedia: false }!",
		).toHaveProperty("loopThisMedia", false);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get a new playOptions with .isRandom set", () => {
		setPlayOptions({ isRandom: true });

		expect(
			getPlayOptions(),
			"playOptions should have { isRandom: true }!",
		).toHaveProperty("isRandom", true);

		setPlayOptions({ isRandom: false });

		expect(
			getPlayOptions(),
			"playOptions should have { isRandom: true }!",
		).toHaveProperty("isRandom", false);
	});
});
