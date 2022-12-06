import { describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { createRoot } from "solid-js";

const { playOptions, toggleLoopMedia, toggleRandom } = await import(
	"@contexts/usePlayOptions"
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing usePlayOptions", () =>
	createRoot((dispose) => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("should get a new playOptions with loop set", () => {
			toggleLoopMedia();

			expect(
				playOptions(),
				"playOptions should have { loop: true }!",
			).toHaveProperty("loop", true);

			toggleLoopMedia();

			expect(
				playOptions(),
				"playOptions should have { loop: false }!",
			).toHaveProperty("loop", false);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("should get a new playOptions with .isRandom set", () => {
			toggleRandom();

			expect(
				playOptions(),
				"playOptions should have { random: true }!",
			).toHaveProperty("isRandom", true);

			toggleRandom();

			expect(
				playOptions(),
				"playOptions should have { random: false }!",
			).toHaveProperty("isRandom", false);
		});

		dispose();
	}));
