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
		setPlayOptions({ loop: true });
		expect(playOptions()).toHaveProperty("loop", true);

		toggleLoopMedia();
		expect(playOptions()).toHaveProperty("loop", false);
	});

	it("should get a new playOptions with .isRandom set", () => {
		setPlayOptions({ random: true });
		expect(playOptions()).toHaveProperty("random", true);

		setPlayOptions({ random: false });
		expect(playOptions()).toHaveProperty("random", false);
	});
});
