export const emptyArray = Object.freeze([]);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function prettyPrintStringArray<T>(arr: readonly T[]) {
	const s = arr.map(item => `"${item}"`).join(",");
	return `[${s}]`;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/** Check if arrays contain the same values, not necessarily on the same order. */
export function areArraysEqualByValue<T>(a: readonly T[], b: readonly T[]) {
	if (!a || !b) return false;
	// Are references equal?
	if (a === b) return true;
	if (a.length !== b.length) return false;

	return a.every(v => b.includes(v));
}
