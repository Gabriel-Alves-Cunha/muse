import { bench, describe } from "vitest";

import { makeRandomString } from "@common/utils";
import { getRandomInt } from "@utils/utils";

const mapOfRandomStrings = new Map(
	Array.from({ length: 10_000 }, () => [
		makeRandomString(getRandomInt(0, 300)),
		{ title: makeRandomString(getRandomInt(0, 300)) },
	]),
);

describe("Benching wich is faster for string comparison.", () => {
	bench("sortByName by compare() function", () => {
		const listAsArrayOfPaths = [...mapOfRandomStrings].sort(
			([, { title: prevTitle }], [, { title: nextTitle }]) =>
				compare(prevTitle, nextTitle),
		);

		const map = new Map(listAsArrayOfPaths);
	});

	bench("sortByName by compare_explicit() function", () => {
		const listAsArrayOfPaths = [...mapOfRandomStrings].sort(
			([, { title: prevTitle }], [, { title: nextTitle }]) =>
				compare_explicit(prevTitle, nextTitle),
		);

		const map = new Map(listAsArrayOfPaths);
	});
});

/**
 * Compare two strings. This comparison is not linguistically accurate, unlike
 * String.prototype.localeCompare(), albeit stable.
 *
 * @returns -1, 0 or 1
 */
export function compare(a: string, b: string) {
	const lenA = a.length;
	const lenB = b.length;

	const minLen = lenA < lenB ? lenA : lenB;

	for (let i = 0; i < minLen; ++i) {
		const ca = a.charCodeAt(i);
		const cb = b.charCodeAt(i);

		if (ca > cb) return 1;
		if (ca < cb) return -1;
	}

	if (lenA === lenB) return 0;

	return lenA > lenB ? 1 : -1;
}

export function compare_explicit(a: string, b: string) {
	a += "";
	b += "";
	const lenA = a.length;
	const lenB = b.length;

	const minLen = lenA < lenB ? lenA : lenB;

	for (let i = 0; i < minLen; ++i) {
		const ca = a.charCodeAt(i);
		const cb = b.charCodeAt(i);

		if (ca > cb) return 1;
		if (ca < cb) return -1;
	}

	if (lenA === lenB) return 0;

	return lenA > lenB ? 1 : -1;
}
