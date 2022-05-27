export const getFirstKey = <Key>(
	mapOrSet: Map<Key, unknown> | Set<Key>,
): Key | undefined => {
	let ret: Key | undefined;

	for (const key of mapOrSet.keys()) {
		ret = key;
		break;
	}

	return ret;
};

const getLastIn =
	(iteratorFn: "entries" | "keys" | "values") =>
	<K, V>(map: Map<K, V> | Set<K>) => {
		const mapIterator = map[iteratorFn]();
		let cur;
		let last;

		while (!(cur = mapIterator.next()).done) last = cur.value;

		return last;
	};
export const getLastItem = getLastIn("entries");
export const getLastValue = getLastIn("values");
export const getLastKey = getLastIn("keys");
