import { time } from "./utils";

export function setDifference<T>(
	a: ReadonlySet<T>,
	b: ReadonlySet<T>,
): ReadonlyArray<T> {
	return time(
		() => Array.from(a).filter(item => !b.has(item)),
		"setDifference",
	);
}
