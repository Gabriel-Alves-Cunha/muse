import { dirname, join, normalize, resolve } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import {
	writeFileSync,
	readFileSync,
	mkdtempSync,
	unlinkSync,
	rmSync,
} from "node:fs";

import { sanitize } from "@main/sanitizeFilename/sanitizeFilename";

import blns from "./bigListOfNaughtyStrings.json";

const REPLACEMENT = "_";

describe("Test sanitizeFilename", () => {
	test("valid names", () => {
		["the quick brown fox jumped over the lazy dog.mp3", "résumé"].forEach(
			(name) => expect(sanitize(name)).toBe(name),
		);

		["valid name.mp3", "résumé"].forEach((name) =>
			expect(sanitize(name, REPLACEMENT)).toBe(name),
		);
	});

	test("null character", () => {
		expect(sanitize("hello\u0000world", REPLACEMENT)).toBe("hello_world");

		expect(sanitize("hello\u0000world")).toBe("helloworld");
	});

	test("control characters", () => {
		expect(sanitize("hello\nworld", REPLACEMENT)).toBe("hello_world");

		expect(sanitize("hello\nworld")).toBe("helloworld");
	});

	test("restricted codes", () => {
		["h?w", "h/w", "h*w"].forEach((name) => {
			expect(sanitize(name, REPLACEMENT)).toBe("h_w");

			expect(sanitize(name)).toBe("hw");
		});
	});

	// https://msdn.microsoft.com/en-us/library/aa365247(v=vs.85).aspx
	test("restricted suffixes", () => {
		["mr.", "mr..", "mr ", "mr  "].forEach((name) =>
			expect(sanitize(name)).toBe("mr"),
		);
	});

	test("relative paths", () => {
		[".", "..", "./", "../", "/..", "/../", "*.|."].forEach((name) =>
			expect(sanitize(name)).toBe(""),
		);
	});

	test("relative path with replacement", () => {
		expect(sanitize("..", REPLACEMENT)).toBe("_");
	});

	test("reserved filename in Windows", () => {
		expect(sanitize("LPT10.txt")).toBe("LPT10.txt");
		expect(sanitize("LPT9.asdfasdf")).toBe("");
		expect(sanitize("aux.txt")).toBe("");
		expect(sanitize("COM1")).toBe("");
		expect(sanitize("PRN.")).toBe("");
		expect(sanitize("con")).toBe("");
	});

	test("reserved filename in Windows with replacement", () => {
		expect(sanitize("LPT10.txt", REPLACEMENT)).toBe("LPT10.txt");
		expect(sanitize("LPT9.asdfasdf", REPLACEMENT)).toBe("_");
		expect(sanitize("aux.txt", REPLACEMENT)).toBe("_");
		expect(sanitize("COM1", REPLACEMENT)).toBe("_");
		expect(sanitize("PRN.", REPLACEMENT)).toBe("_");
		expect(sanitize("con", REPLACEMENT)).toBe("_");
	});

	test("invalid replacement", () => {
		expect(sanitize("valid.txt", '/:*?"<>|')).toBe("valid.txt");
		expect(sanitize("foo?.txt", ">")).toBe("foo.txt");
		expect(sanitize("con.txt", "aux")).toBe("");
		expect(sanitize(".", ".")).toBe("");
	});

	test("255 characters max", () => {
		const string = "a".repeat(300);

		expect(sanitize(string).length <= 255).toBe(true);
		expect(string.length > 255).toBe(true);
	});

	describe("Test the handling of non-BMP chars in UTF-8", () => {
		test("non-bmp SADDLES the limit", () => {
			const str25x = "a".repeat(252);
			const name = `${str25x}\uD800\uDC00`;

			expect(sanitize(name)).toBe(str25x);
		});

		test("non-bmp JUST WITHIN the limit", () => {
			const str25x = "a".repeat(251);
			const name = `${str25x}\uD800\uDC00`;

			expect(sanitize(name)).toBe(name);
		});

		test("non-bmp JUST OUTSIDE the limit", () => {
			const str25x = "a".repeat(253);
			const name = `${str25x}\uD800\uDC00`;

			expect(sanitize(name)).toBe(str25x);
		});
	});

	describe("Test invalid input", () => {
		test("No args", () => {
			// @ts-ignore => Testing with no args:
			expect(() => sanitize()).toThrow();
		});

		test("invalid input", () => {
			[
				undefined,
				null,
				false,
				true,
				{},
				{
					toString: () => "bar",
					replace: () => "foo",
				},
				{
					toString: () => "barrel",
				},
				[],
				Buffer.from("asdf"),
			].forEach((input) => {
				// @ts-ignore => Testing for input that is not string:
				expect(() => sanitize(input)).toThrow();
			});
		});
	});

	describe("Test writing files to the local filesystem.", () => {
		function testStringUsingFS(str: string) {
			const sanitized = sanitize(str) || "default";
			const sanitizedFilepath = join(tempdir, sanitized);

			// Should not contain any directories or relative paths
			expect(dirname(resolve("/abs/path", sanitized))).toBe(
				resolve("/abs/path"),
			);

			expect(
				Buffer.byteLength(sanitized) <= 255,
				"Should be max 255 bytes",
			).toBe(true);

			// Should write and read file to disk
			expect(dirname(normalize(sanitizedFilepath))).toBe(tempdir);

			const expectedFileContents = "foobar";

			writeFileSync(sanitizedFilepath, expectedFileContents);

			const fileContents = readFileSync(sanitizedFilepath, {
				encoding: "utf-8",
			});

			expect(fileContents, "File path is not sanitized.").toBe(
				expectedFileContents,
			);

			unlinkSync(sanitizedFilepath);
		}

		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////

		const tempdir = mkdtempSync("sanitize-filename-test");

		const arr = [""].concat(
			[
				"a".repeat(300),
				"the quick brown fox jumped over the lazy dog",
				"résumé",
				"hello\u0000world",
				"hello\nworld",
				"semi;colon.js",
				";leading-semi.js",
				"slash\\.js",
				"slash/.js",
				"col:on.js",
				"star*.js",
				"question?.js",
				'quote".js',
				"singlequote'.js",
				"brack<e>ts.js",
				"p|pes.js",
				"plus+.js",
				"'five and six<seven'.js",
				" space at front",
				"space at end ",
				".period",
				"period.",
				"relative/path/to/some/dir",
				"/abs/path/to/some/dir",
				"~/.\u0000notssh/authorized_keys",
				"",
				"h?w",
				"h/w",
				"h*w",
				".",
				"..",
				"./",
				"../",
				"/..",
				"/../",
				"*.|.",
				"./",
				"./foobar",
				"../foobar",
				"../../foobar",
				"./././foobar",
				"|*.what",
				"LPT9.asdf",
			],
			blns,
		);

		for (const str of arr)
			test(JSON.stringify(str), () => testStringUsingFS(str));

		afterAll(() => {
			rmSync(tempdir, { recursive: true, force: true });
		});
	});
});
