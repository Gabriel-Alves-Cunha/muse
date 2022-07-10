import { describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "../../../../mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

const { playOptions, setPlayOptions, toggleLoopMedia } = await import(
	"@contexts/mediaHandler/usePlayOptions"
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
		expect(playOptions(), "playOptions should have { loop: true }!")
			.toHaveProperty("loop", true);

		toggleLoopMedia();
		expect(playOptions(), "playOptions should have { loop: false }!")
			.toHaveProperty("loop", false);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should get a new playOptions with .isRandom set", () => {
		setPlayOptions({ random: true });
		expect(playOptions(), "playOptions should have { random: true }!")
			.toHaveProperty("random", true);

		setPlayOptions({ random: false });
		expect(playOptions(), "playOptions should have { random: true }!")
			.toHaveProperty("random", false);
	});
});
