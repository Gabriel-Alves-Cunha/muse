import { type UseBoundStore, type StoreApi, create } from "zustand";

import { EMPTY_ARRAY, EMPTY_MAP } from "./empty";
import { error } from "@common/log";

export const MapWithIndex = <Key, Value>(
	entries?: Iterable<readonly [Key, Value]> | null,
): MapWithIndexType<Key, Value> =>
	create<MapWithIndexInnerType<Key, Value>>()((set, get) => ({
		map: new Map(entries),

		keysArray: (() => {
			const keysArray: Key[] = [];

			if (entries) for (const [key] of entries) keysArray.push(key);

			return keysArray;
		})(),

		get size(): number {
			return get().keysArray.length;
		},

		get last(): Value | undefined {
			const lastKey = get().keysArray.at(-1);

			return lastKey === undefined ? undefined : get().map.get(lastKey);
		},

		set(key: Key, value: Value): void {
			const newMap = new Map(get().map).set(key, value);
			const newKeysArray = Array.from(get().keysArray);

			newKeysArray.push(key);

			set({ map: newMap, keysArray: newKeysArray });
		},

		getAt(index: number): Value | undefined {
			const key = this.keysArray.at(index);

			return key === undefined ? undefined : this.map.get(key);
		},

		clear(): void {
			set({ map: EMPTY_MAP, keysArray: EMPTY_ARRAY });
		},

		delete(key: Key): boolean {
			const { keysArray, map } = get();

			const hasKey = map.has(key);

			if (!hasKey) return false;

			const newMap = new Map(map);
			newMap.delete(key);

			const index = keysArray.indexOf(key);

			if (index === -1) {
				error(
					"Tried to delete non-existing key from array, but it was deleted from map.",
					{
						prevMap: map,
						keysArray,
						newMap,
						key,
					},
				);

				set({ map: newMap });

				return true;
			}

			// remove from array
			const newKeysArray = Array.from(keysArray);
			newKeysArray.splice(index, 1);

			set({ map: newMap, keysArray: newKeysArray });

			return true;
		},

		forEach(
			callbackfn: (
				key: Readonly<Key>,
				value: Readonly<Value>,
				index: Readonly<number>,
			) => void,
		): void {
			let index = 0;

			get().map.forEach((value, key) => {
				callbackfn(key, value, index);

				++index;
			});
		},

		get(key: Key): Value | undefined {
			return get().map.get(key);
		},

		has(key: Key): boolean {
			return get().map.has(key);
		},

		entries(): IterableIterator<readonly [Key, Value]> {
			return get().map.entries();
		},

		keys(): IterableIterator<Key> {
			return get().map.keys();
		},

		values(): IterableIterator<Value> {
			return get().map.values();
		},

		[Symbol.iterator](): IterableIterator<[Key, Value]> {
			const iter = get().map[Symbol.iterator]();

			return iter;
		},

		toString(): string {
			let index = 0;
			let str = "[";

			for (const [key, value] of get().map) {
				str += `[${key}, ${value}]`;

				++index;
			}

			return `${str}]`;
		},

		inspect(): string {
			let index = 0;
			let str = "[\n";

			for (const [key, value] of get().map) {
				str += `  [${index}, \`${key}\`: \`${value}\`]\n`;

				++index;
			}

			return `${str}]`;
		},

		mapToArray<R>(
			callbackfn: (
				key: Readonly<Key>,
				value: Readonly<Value>,
				index: Readonly<number>,
			) => R,
		): R[] {
			const array: R[] = [];
			let index = 0;

			for (const [key, value] of get().map) {
				array.push(callbackfn(key, value, index));

				++index;
			}

			return array;
		},

		filterToArray<R>(
			callbackfn: (key: Key, value: Value, index: number) => R,
		): [Key, Value][] {
			const array: [Key, Value][] = [];
			let index = 0;

			for (const [key, value] of get().map) {
				if (callbackfn(key, value, index)) array.push([key, value]);

				++index;
			}

			return array;
		},

		sortToArray(
			compareFn: (a: readonly [Key, Value], b: readonly [Key, Value]) => number,
		): [Key, Value][] {
			const sortedMapAsArray = [...get().map].sort(compareFn);

			return sortedMapAsArray;
		},

		sortInPlace(
			compareFn: (a: readonly [Key, Value], b: readonly [Key, Value]) => number,
		): void {
			const sortedArray = get().sortToArray(compareFn);
			const newKeysArray = sortedArray.map(([key]) => key);

			set({ map: new Map(sortedArray), keysArray: newKeysArray });
		},

		indexOf(key: Key): number {
			const index = get().keysArray.indexOf(key);

			return index;
		},
	}));

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type MapWithIndexType<Key, Value> = UseBoundStore<
	StoreApi<MapWithIndexInnerType<Key, Value>>
>;

////////////////////////////////////////////////

export type MapWithIndexInnerType<Key, Value> = {
	/** Executes a provided function once per each key/value pair in the Map, in insertion order. */
	forEach(
		callbackfn: (
			key: Readonly<Key>,
			value: Readonly<Value>,
			index: Readonly<number>,
		) => void,
	): void;
	mapToArray<R>(
		callbackfn: (
			key: Readonly<Key>,
			value: Readonly<Value>,
			index: Readonly<number>,
		) => R,
	): R[];
	sortInPlace(
		compareFn: (a: readonly [Key, Value], b: readonly [Key, Value]) => number,
	): void;
	sortToArray(
		compareFn: (a: readonly [Key, Value], b: readonly [Key, Value]) => number,
	): [Key, Value][];
	[Symbol.iterator](): IterableIterator<readonly [Key, Value]>;
	entries(): IterableIterator<readonly [Key, Value]>;
	getAt(index: number): Value | undefined;
	values(): IterableIterator<Value>;
	set(key: Key, value: Value): void;
	get(key: Key): Value | undefined;
	keys(): IterableIterator<Key>;
	indexOf(key: Key): number;
	/** @returns true if an element in the Map existed and has been removed, or false if the element does not exist. */
	delete(key: Key): boolean;
	last: Value | undefined;
	has(key: Key): boolean;
	map: Map<Key, Value>;
	toString(): string;
	inspect(): string;
	keysArray: Key[];
	clear(): void;
	size: number;
};
