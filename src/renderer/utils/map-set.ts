export const emptyMap: ReadonlyMap<never, never> = new Map<never, never>();
export const emptySet: ReadonlySet<never> = new Set<never>();

////////////////////////////////////////////////

export function getFirstKey<Key>(
	mapOrSet: ReadonlyMap<Key, unknown> | ReadonlySet<Key>,
): Readonly<Key | undefined> {
	if (mapOrSet instanceof Map) {
		const [key_] = mapOrSet as ReadonlyMap<Key, unknown>;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const [key] = key_!;

		return key;
	} else {
		const [key] = mapOrSet as ReadonlySet<Key>;

		return key;
	}
}

////////////////////////////////////////////////

const getLastOf = (iteratorFn: "entries" | "keys" | "values") =>
	<K, V>(map: ReadonlyMap<K, V> | ReadonlySet<K>) => {
		const mapIterator = map[iteratorFn]();
		let curr;
		let last;

		while (!(curr = mapIterator.next()).done) last = curr.value;

		return last;
	};

export const getLastItem = getLastOf("entries");
export const getLastValue = getLastOf("values");
export const getLastKey = getLastOf("keys");
