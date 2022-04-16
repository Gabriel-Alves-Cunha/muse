import { describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { PlayOptionsType, usePlayOptions } from "@contexts";

const { getState: getPlayOptions } = usePlayOptions;

describe("Testing usePlayOptions", () => {
	it("should get a new playOptions with .loopThisMedia set", () => {
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.LOOP_THIS_MEDIA,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopThisMedia", true);
		}
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.LOOP_THIS_MEDIA,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("loopThisMedia", false);
		}
	});

	it("should get a new playOptions with .isRandom set", () => {
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.IS_RANDOM,
				value: true,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("isRandom", true);
		}
		{
			getPlayOptions().setPlayOptions({
				type: PlayOptionsType.IS_RANDOM,
				value: false,
			});

			const playOptions = getPlayOptions().playOptions;

			expect(playOptions).toHaveProperty("isRandom", false);
		}
	});
});
