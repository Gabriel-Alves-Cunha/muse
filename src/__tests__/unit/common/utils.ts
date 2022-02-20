/* eslint-disable */

import {
	getPathWithoutExtension,
	getLastExtension,
	formatDuration,
	getBasename,
} from "../../../common/utils";

it("should get path without extension", () => {
	const paths = [
		"/home/music/hello.mp3",
		"\\home\\docs\\how",
		"are.test.js",
		"you.webp",
		"bye.",
		".gitignore",
	];

	const pathsWithNoExtension = paths.map(path => getPathWithoutExtension(path));

	expect(pathsWithNoExtension).toStrictEqual([
		"/home/music/hello",
		"\\home\\docs\\how",
		"are",
		"you",
		"bye",
		"",
	]);
});

it("should format duration in seconds to something like: 00:00:00", () => {
	const durationsInSeconds = [234567, 2345678, 123, 6543, 224, 900, undefined];

	const durationsFormated = durationsInSeconds.map(time =>
		formatDuration(time),
	);

	expect(durationsFormated).toStrictEqual([
		"2d 17:09:27",
		"27d 03:34:38",
		"02:03",
		"01:49:03",
		"03:44",
		"15:00",
		"",
	]);
});

it("should get the basename of a path", () => {
	const paths = [
		"/home/music/hello.mp3",
		"\\home\\docs\\how",
		"are.test.js",
		"you.webp",
		"bye.",
		".gitignore",
	];

	const basenames = paths.map(path => getBasename(path));

	expect(basenames).toStrictEqual(["hello", "how", "are", "you", "bye", ""]);
});

it("should get the extension of a file", () => {
	const paths = [
		"/home/music/hello.mp3",
		"\\home\\docs\\how",
		"are.test.js",
		"you.webp",
		"bye.",
		".gitignore",
		"",
	];

	const extensions = paths.map(path => getLastExtension(path));

	console.log({ extensions });

	expect(extensions).toStrictEqual(["mp3", "", "js", "webp", "", "", ""]);
});
