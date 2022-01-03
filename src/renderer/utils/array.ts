export const remove = <T>(
	array: readonly T[],
	indexToRemove: Readonly<number>
): readonly T[] => [
	...array.slice(0, indexToRemove),
	...array.slice(indexToRemove + 1),
];

export const concatFromIndex = <T>(
	array: readonly T[],
	indexToConcatFrom: Readonly<number>,
	arrayToBeAdded: readonly T[]
): readonly T[] => [
	...array,
	...arrayToBeAdded.slice(indexToConcatFrom, arrayToBeAdded.length),
];

export const replace = <T>(
	array: readonly T[],
	indexToRemove: Readonly<number>,
	replacement: Readonly<T>
): readonly T[] => [
	...array.slice(0, indexToRemove),
	replacement,
	...array.slice(indexToRemove + 1),
];

export const sort = <T>(
	array: readonly T[],
	compareFunction?: (a: Readonly<T>, b: Readonly<T>) => Readonly<number>
): readonly T[] => [...array].sort(compareFunction);

export const pop = <T>(array: readonly T[]): readonly T[] => array.slice(0, -1);

export const push = <T>(
	array: readonly T[],
	newEntry: Readonly<T>
): readonly T[] => [...array, newEntry];

export const shift = <T>(array: readonly T[]): readonly T[] => array.slice(1);

export const reverse = <T>(array: readonly T[]): readonly T[] =>
	[...array].reverse();
