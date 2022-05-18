import { describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import {
	PlayOptionsType,
	getPlayOptions,
	setPlayOptions,
} from "@contexts/mediaHandler/usePlayOptions";

describe("Testing usePlayOptions", () => {
	it("should get a new playOptions with .loopThisMedia set", () => {
		{
			setPlayOptions({
				type: PlayOptionsType.LOOP_THIS_MEDIA,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopThisMedia", true);
		}
		{
			setPlayOptions({
				type: PlayOptionsType.LOOP_THIS_MEDIA,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopThisMedia", false);
		}
	});

	it("should get a new playOptions with .isRandom set", () => {
		{
			setPlayOptions({
				type: PlayOptionsType.IS_RANDOM,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("isRandom", true);
		}
		{
			setPlayOptions({
				type: PlayOptionsType.IS_RANDOM,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("isRandom", false);
		}
	});
});
