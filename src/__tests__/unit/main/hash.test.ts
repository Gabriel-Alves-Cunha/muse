import { assert, expect, it } from "vitest";

import { string2number } from "@common/hash";

it("should produce (fast) a hash (integer) from a string", () => {
	const testStrings = [
		"iewbvpiuvbusdoivnosd",
		"/home/dir/name.mp3",
		"a".repeat(500),
		".......",
		"",
	];

	console.time("hashing");
	const result1 = testStrings.map(str => string2number(str, 12913042));
	const result2 = testStrings.map(str => string2number(str, 12913042));
	console.timeEnd("hashing");

	result1.forEach(res => assert(Number.isInteger(res)));

	expect(result1).toStrictEqual(result2);
});
