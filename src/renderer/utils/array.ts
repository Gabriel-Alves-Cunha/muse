import { dbg } from "@common/utils";

export const constRefToEmptyArray = Object.freeze([]);

export function areArraysEqual<T>(a: T[], b: T[]) {
	if (!a || !b) return false;
	// Are references equal?
	if (a === b) return true;
	if (a.length !== b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	const aSorted = a.slice().sort();
	const bSorted = b.slice().sort();

	for (let i = 0; i < aSorted.length; ++i)
		if (aSorted[i] !== bSorted[i]) {
			dbg(
				"arraysEqual(): aSorted[i] = '",
				aSorted[i],
				"' is not equal to bSorted[i] = '",
				bSorted[i],
				"'",
			);
			return false;
		}

	return true;
}

export const repeat = <T>(array: T[], length: number) =>
	Array.from<T, T[]>({ length }, () => array);
