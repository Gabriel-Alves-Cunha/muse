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

export const constRefToEmptyArray = Object.freeze([]);
