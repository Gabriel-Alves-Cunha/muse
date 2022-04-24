import { assert, expect, it } from "vitest";

import { assertUnreachable, getRandomInt, capitalize } from "@utils/utils";

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

	const result = strings.map(str => capitalize(str));

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

it("should get a random integer between min (included) and max (not included)", () => {
	const length = 100;
	const results1 = Array.from({ length }, (_, i) => getRandomInt(i, i + 100));
	const results2 = Array.from({ length }, (_, i) => getRandomInt(i, i + 100));

	const additional = [
		getRandomInt(10.2427687, 23.24356),
		getRandomInt(10.31, 23),
		getRandomInt(10, 23.31),
		getRandomInt(NaN, NaN),
		getRandomInt(NaN, 10),
		getRandomInt(10, NaN),
	];

	results1.push(...additional);
	results2.push(...additional);

	results1.forEach(result => assert(Number.isInteger(result)));

	expect(results1).not.toStrictEqual(results2);
});

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
