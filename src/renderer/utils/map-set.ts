export function getFirstKey<Key>(
	mapOrSet: ReadonlyMap<Key, unknown> | ReadonlySet<Key>,
): Key | undefined {
	if (mapOrSet instanceof Map) {
		if (mapOrSet.size < 1) return;

		// @ts-ignore => We are already making sure it exists at least one entry with the `if` above.
		const [[key]] = mapOrSet as ReadonlyMap<Key, unknown>;

		return key as Key;
	} else {
		const [key] = mapOrSet as ReadonlySet<Key>;

		return key;
	}
}

////////////////////////////////////////////////

const getLastOf =
	(iteratorFn: "entries" | "keys" | "values") =>
	<Key, Value>(map: Map<Key, Value> | Set<Key>) => {
		const mapIterator = map[iteratorFn]();
		let curr;
		let last;

		while (!(curr = mapIterator.next()).done) last = curr.value;

		return last;
	};

export const getLastItem = getLastOf("entries");
export const getLastValue = getLastOf("values");
export const getLastKey = getLastOf("keys");
