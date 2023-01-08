import { bench, afterAll } from "vitest";

import { areArraysEqualByValue } from "@utils/array";
import { ids, list, randomIndex } from "./ce";

let nextMediaID_while = "";
let nextMediaID_array = "";
let while_list: string[] = [];
let arr_list: string[] = [];
const arr = [...list];
const [first] = arr;
const last = arr.at(arr.length - 1);
let first_while = "";
let first_array = "";

bench(
	"while",
	() => {
		let index = 0;
		let curr;

		while (!(curr = ids.next()).done) {
			if (index === 0) first_while = curr.value;

			while_list.push(curr.value);

			if (index === randomIndex) {
				nextMediaID_while = curr.value;
				break;
			}

			++index;
		}
	},
	{ warmupIterations: 0 },
);

bench(
	"array",
	() => {
		let index = 0;

		for (const newID of ids) {
			if (index === 0) first_array = newID;

			arr_list.push(newID);

			if (index === randomIndex) {
				nextMediaID_array = newID;
				break;
			}

			++index;
		}
	},
	{ warmupIterations: 0 },
);

afterAll(() => {
	console.log({
		actual: arr[randomIndex],
		first,
		last,
		first_array,
		first_while,
		arr_listLength: arr_list.length,
		while_listLength: while_list.length,
		areListsEqual: areArraysEqualByValue(arr_list, while_list),
		randomIndex,
		nextMediaID_while,
		nextMediaID_array,
	});
});
