import { describe, expect, test } from "vitest";

import { truncate, isHighSurrogate } from "@main/sanitizeFilename/truncate";

import blns from "./bigListOfNaughtyStrings.json";

function assertLengths(
	str: string,
	charLength: number,
	byteLength: number,
): void {
	expect(Buffer.byteLength(str)).toBe(byteLength);

	expect(str.length).toBe(charLength);
}

describe("Test writing files to the fs", () => {
	test("strings", () => {
		assertLengths(truncate("a☃", 2), 1, 1);

		assertLengths(truncate(`${"a".repeat(250)}\uD800\uDC00`, 255), 252, 254);

		assertLengths(truncate(`${"a".repeat(251)}\uD800\uDC00`, 255), 253, 255);

		assertLengths(truncate(`${"a".repeat(252)}\uD800\uDC00`, 255), 252, 252);

		assertLengths(truncate(`${"a".repeat(253)}\uD800\uDC00`, 255), 253, 253);

		assertLengths(truncate(`${"a".repeat(254)}\uD800\uDC00`, 255), 254, 254);

		assertLengths(truncate(`${"a".repeat(255)}\uD800\uDC00`, 255), 255, 255);
	});

	test("Truncate various strings", () => {
		[""]
			.concat(
				[
					"a".repeat(300),
					`${"a".repeat(252)}\uD800\uDC00`,
					`${"a".repeat(251)}\uD800\uDC00`,
					`${"a".repeat(253)}\uD800\uDC00`,
				],
				blns,
			)
			.forEach((str) =>
				test(JSON.stringify(str), () => {
					expect(truncate(str, 0)).toBe("");

					let i = 0;

					// Truncate string one byte at a time
					while (true) {
						const truncated = truncate(str, i);

						// @ts-ignore
						expect(!isHighSurrogate(truncated.at(-1))).toBe(true);
						expect(Buffer.byteLength(truncated) <= i).toBe(true);

						if (truncated === str) break;

						++i;
					}
				}),
			);
	});
});
