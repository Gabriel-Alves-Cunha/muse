import type { Draft } from "immer";

import produce from "immer";

export const add2end = <Value>(arr: Array<Value>, thingToAdd: Draft<Value>) =>
	produce(arr, draft => {
		draft.push(thingToAdd);
	});

export const deletedByIndex = <Value>(arr: Array<Value>, index: number) =>
	produce(arr, draft => {
		draft.splice(index, 1);
	});

export const updatedByIndex = <Value>(
	arr: Array<Value>,
	index: number,
	updatedValue: Draft<Value>,
) =>
	produce(arr, draft => {
		draft[index] = updatedValue;
	});

export const insertAtIndex = <Value>(
	arr: Array<Value>,
	index: number,
	thingToAdd: Draft<Value>,
) =>
	produce(arr, draft => {
		draft.splice(index, 0, thingToAdd);
	});

export const removeLast = <Value>(arr: Array<Value>) =>
	produce(arr, draft => {
		draft.pop();
	});

export const removeFirst = <Value>(arr: Array<Value>) =>
	produce(arr, draft => {
		draft.shift();
	});

export const add2start = <Value>(arr: Array<Value>, thingToAdd: Draft<Value>) =>
	produce(arr, draft => {
		draft.unshift(thingToAdd);
	});

export const deleteByIndex = <Value>(arr: Array<Value>, index: number) =>
	produce(arr, draft => {
		draft.splice(index, 1);
	});

// filtering items
export const filter = <Value>(
	arr: Array<Value>,
	filterBy: (
		value: Draft<Value>,
		index?: number,
		array?: Draft<Value>[],
	) => boolean,
) =>
	produce(arr, draft => {
		return draft.filter(filterBy);
	});
