export const emptyMap: ReadonlyMap<never, never> = new Map<never, never>();

export function getFirstKey<Key>(
	mapOrSet: Map<Key, unknown> | Set<Key>,
): Key | undefined {
	let ret: Key | undefined;

	for (const key of mapOrSet.keys()) {
		ret = key;
		break;
	}

	return ret;
}

const getLastIn = (iteratorFn: "entries" | "keys" | "values") =>
	<K, V>(map: Map<K, V> | Set<K>) => {
		const mapIterator = map[iteratorFn]();
		let curr;
		let last;

		while (!(curr = mapIterator.next()).done) last = curr.value;

		return last;
	};
export const getLastItem = getLastIn("entries");
export const getLastValue = getLastIn("values");
export const getLastKey = getLastIn("keys");
