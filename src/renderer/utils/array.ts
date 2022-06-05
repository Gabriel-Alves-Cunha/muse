import { dbg } from "@common/utils";

export const remove = <T>(
	array: readonly T[],
	indexToRemove: Readonly<number>,
): readonly T[] => [
	...array.slice(0, indexToRemove),
	...array.slice(indexToRemove + 1),
];

export const concatFromIndex = <T>(
	array: readonly T[],
	indexToConcatFrom: Readonly<number>,
	arrayToBeAdded: readonly T[],
): readonly T[] => [
	...array,
	...arrayToBeAdded.slice(indexToConcatFrom, arrayToBeAdded.length),
];

export const replace = <T>(
	array: readonly T[],
	indexToRemove: Readonly<number>,
	replacement: Readonly<T>,
): readonly T[] => [
	...array.slice(0, indexToRemove),
	replacement,
	...array.slice(indexToRemove + 1),
];

export const sort = <T>(
	array: readonly T[],
	// eslint-disable-next-line no-unused-vars
	compareFunction?: (a: Readonly<T>, b: Readonly<T>) => Readonly<1 | -1 | 0>,
): readonly T[] => [...array].sort(compareFunction);

/** Get a new array without the last item. */
export const pop = <T>(array: readonly T[]): readonly T[] => array.slice(0, -1);

/** Get a new array with a new item at the beginning. */
export const push = <T>(
	array: readonly T[],
	newEntry: Readonly<T>,
): readonly T[] => [...array, newEntry];

/** Get a new array without the first item. */
export const shift = <T>(array: readonly T[]): readonly T[] => array.slice(1);

/** Get a new reversed array. */
export const reverse = <T>(array: readonly T[]): readonly T[] =>
	[...array].reverse();

/** Add one or more items to the start of the array. */
export const unshift = <T>(
	array: readonly T[],
	...items: T[]
): readonly T[] => [...items, ...array];

/** Get item and its index from array. */
export const getItemAndIndex = <T>(
	array: readonly T[],
	predicate: (value: T, index: number, obj: readonly T[]) => unknown,
): Readonly<[T, number]> | Readonly<[undefined, -1]> => {
	const index = array.findIndex(predicate);

	if (index === -1) return [undefined, -1];

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return [array[index]!, index] as const;
};

export const constRefToEmptyArray = Object.freeze([]);

export function areArraysEqual<T>(a: T[], b: T[]) {
	// Are references equal?
	if (a === b) return true;
	if (a == null || b == null) return false;
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
