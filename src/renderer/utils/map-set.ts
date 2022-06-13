export const emptyMap: ReadonlyMap<never, never> = new Map<never, never>();
export const emptySet: ReadonlySet<never> = new Set<never>();

export function getFirstKey<Key>(
	mapOrSet: ReadonlyMap<Key, unknown> | ReadonlySet<Key>,
): Readonly<Key | undefined> {
	let ret: Key | undefined;

	for (const key of mapOrSet.keys()) {
		ret = key;
		break;
	}

	return ret;
}

const getLastIn = (iteratorFn: "entries" | "keys" | "values") =>
	<K, V>(map: ReadonlyMap<K, V> | Set<K>) => {
		const mapIterator = map[iteratorFn]();
		let curr;
		let last;

		while (!(curr = mapIterator.next()).done) last = curr.value;

		return last;
	};
export const getLastItem = getLastIn("entries");
export const getLastValue = getLastIn("values");
export const getLastKey = getLastIn("keys");
