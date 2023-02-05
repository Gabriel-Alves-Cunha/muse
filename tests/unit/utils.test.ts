import { assert, expect, it } from "vitest";

import { formatDuration } from "@utils/utils";
import { sleep } from "@utils/utils";
import {
	getPathWithoutExtension,
	getLastExtension,
	getBasename,
} from "@utils/path";
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

	function myTest() {
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

it("should get path without extension. #getPathWithoutExtension", () => {
	const paths = [
		"/home/music/hello.mp3",
		"\\home\\docs\\how",
		"are.test.js",
		"you.webp",
		"bye.",
		".gitignore",
	];

	const pathsWithNoExtension = paths.map((path) =>
		getPathWithoutExtension(path),
	);

	expect(pathsWithNoExtension).toStrictEqual([
		"/home/music/hello",
		"\\home\\docs\\how",
		"are",
		"you",
		"bye",
		"",
	]);
});

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

it("should format duration in seconds to something like: '00:00:00'. #formatDuration", () => {
	const durationsInSeconds = [234567, 2345678, 123, 6543, 224, 900, undefined];

	const durationsFormated = durationsInSeconds.map((time) =>
		formatDuration(time),
	);

	expect(durationsFormated).toStrictEqual([
		"2d 17:09:27",
		"27d 03:34:38",
		"02:03",
		"01:49:03",
		"03:44",
		"15:00",
		"00:00",
	]);
});

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

it("should get the basename of a path. #getBasename", () => {
	const paths = [
		"/home/music/hello.mp3",
		"\\home\\docs\\how",
		"are.test.js",
		"you.webp",
		"bye.",
		".gitignore",
	];

	const basenames = paths.map((path) => getBasename(path));

	expect(basenames).toStrictEqual(["hello", "how", "are", "you", "bye", ""]);
});

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

it("should get the extension of a file. #getLastExtension", () => {
	const paths = [
		"/home/music/hello.mp3",
		"\\home\\docs\\how",
		"are.test.js",
		"you.webp",
		"bye.",
		".gitignore",
		"",
	];

	const extensions = paths.map((path) => getLastExtension(path));

	expect(extensions).toStrictEqual(["mp3", "", "js", "webp", "", "", ""]);
});
