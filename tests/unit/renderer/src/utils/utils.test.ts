import { assert, expect, it } from "vitest";

import { sleep } from "@common/utils";
import {
	assertUnreachable,
	getRandomInt,
	capitalize,
	time,
} from "@utils/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("should time a function and return what it's result", async () => {
	function doAndReturnSomething(arg: number): number {
		return time(() => arg + 10, "doAndReturnSomething");
	}

	const ret = doAndReturnSomething(10);

	expect(ret).toBe(20);

	/////////////////////////////////////////////

	async function doAndReturnSomethingAsync(arg: number): Promise<number> {
		return await time(async () => {
			await sleep(10);
			return arg + 100;
		}, "doAndReturnSomethingAsync");
	}

	const ret2 = await doAndReturnSomethingAsync(10);

	expect(ret2).toBe(110);
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("should capitalize a string", () => {
	const strings = Object.freeze([
		"1 cup of water",
		".gitignore",
		"jupyter",
		"9 lifes",
		" hello",
		"Venus",
		"mars",
		"",
	]);

	const result = strings.map((str) => capitalize(str));

	expect(result).toStrictEqual([
		"1 cup of water",
		".gitignore",
		"Jupyter",
		"9 lifes",
		" hello",
		"Venus",
		"Mars",
		"",
	]);
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("should get a random integer between min (included) and max (not included)", () => {
	const length = 100;
	const results1 = Array.from({ length }, (_, i) => getRandomInt(i, i + 100));
	const results2 = Array.from({ length }, (_, i) => getRandomInt(i, i + 100));

	const additional = [
		getRandomInt(10.2427687, 23.24356),
		getRandomInt(10.31, 23),
		getRandomInt(10, 23.31),
		getRandomInt(1043, 234354),
		getRandomInt(354355454, 5354),
	];

	results1.push(...additional);
	results2.push(...additional);

	for (const result of results1) assert(Number.isInteger(result));

	expect(results1).not.toStrictEqual(results2);
});

it("should throw an error when trying to get a random integer between min (included) and max (not included) with not an finite number", () => {
	const fns = [
		() => getRandomInt(NaN, NaN),
		() => getRandomInt(NaN, 10),
		() => getRandomInt(10, NaN),
	];

	for (const fn of fns) expect(fn).toThrowError();
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("should log a message that code should not have reached that point", () => {
	type Option = "foo" | "bar";
	const option: Option = "bar";

	function myTest(): void {
		switch (option) {
			case "foo": {
				break;
			}

			default:
				// @ts-ignore Error log is expected
				assertUnreachable(option);
		}
	}

	expect(myTest).toThrowError();
});
