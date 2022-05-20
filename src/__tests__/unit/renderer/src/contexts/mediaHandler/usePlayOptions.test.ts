import { describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import {
	toggleLoopMedia,
	getPlayOptions,
	setPlayOptions,
} from "@contexts/mediaHandler/usePlayOptions";

describe("Testing usePlayOptions", () => {
	it("should get a new playOptions with .loopThisMedia set", () => {
		{
			setPlayOptions({
				loopThisMedia: true,
			});

			const playOptions = getPlayOptions();

			expect(playOptions).toHaveProperty("loopThisMedia", true);
		}
		{
			toggleLoopMedia();

			const playOptions = getPlayOptions();

			expect(playOptions).toHaveProperty("loopThisMedia", false);
		}
	});

	it("should get a new playOptions with .isRandom set", () => {
		{
			setPlayOptions({
				isRandom: true,
			});

			const playOptions = getPlayOptions();

			expect(playOptions).toHaveProperty("isRandom", true);
		}
		{
			setPlayOptions({
				isRandom: false,
			});

			const playOptions = getPlayOptions();

			expect(playOptions).toHaveProperty("isRandom", false);
		}
	});
});
