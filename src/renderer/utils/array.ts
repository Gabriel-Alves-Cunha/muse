export const emptyArray: readonly never[] = [];

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function prettyPrintStringArray<T>(arr: readonly T[]): string {
	const s = arr.map((item) => `"${item}"`).join(",");

	return `[${s}]`;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/** Check if arrays contain the same values, not necessarily on the same order. */
export function areArraysEqualByValue<T>(
	a: readonly T[],
	b: readonly T[],
): boolean {
	if (!(a && b)) return false;
	// Are references equal?
	if (a === b) return true;
	if (a.length !== b.length) return false;

	return a.every((v) => b.includes(v));
}
