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
		setPlayOptions({ loop: true });
		expect(
			getPlayOptions(),
			"playOptions should have { loop: true }!",
		).toHaveProperty("loop", true);

		toggleLoopMedia();
		expect(
			getPlayOptions(),
			"playOptions should have { loop: false }!",
		).toHaveProperty("loop", false);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get a new playOptions with .isRandom set", () => {
		setPlayOptions({ random: true });
		expect(
			getPlayOptions(),
			"playOptions should have { random: true }!",
		).toHaveProperty("random", true);

		setPlayOptions({ random: false });
		expect(
			getPlayOptions(),
			"playOptions should have { random: true }!",
		).toHaveProperty("random", false);
	});
});
