import type { Draft } from "immer";

import produce from "immer";

type Key = string | number | symbol;
type Obj<Value> = Record<Key, Value>;

export const add = <Value>(
	obj: Obj<Value>,
	keyToAdd: string,
	valueToAdd: Draft<Value>,
) =>
	produce(obj, draft => {
		draft[keyToAdd] = valueToAdd;
	});

export const deleted = <Value>(obj: Obj<Value>, keyToDelete: Key) =>
	produce(obj, draft => {
		delete draft[keyToDelete];
	});

// update
export const updated = <Value>(
	obj: Obj<Value>,
	keyToUpdate: Key,
	updatedValue: Draft<Value>,
) =>
	produce(obj, draft => {
		draft[keyToUpdate] = updatedValue;
	});
