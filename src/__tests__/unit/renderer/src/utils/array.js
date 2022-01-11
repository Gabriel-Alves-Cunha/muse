/* eslint-disable */

const {
	concatFromIndex,
	replace,
	reverse,
	remove,
	shift,
	push,
	sort,
	pop,
} = require("../../../../../renderer/utils/array");

it("should return a new joined array. The first array will be fully copied, the second will be fully copied from a given index", () => {
	const fstArray = Object.freeze(["hello", ",", " ", "mother", "."]);
	const scdArray = Object.freeze([
		"hello",
		",",
		" ",
		"mother",
		".",
		" How",
		" are",
		" you",
	]);

	const joinedArray = concatFromIndex(
		fstArray,
		scdArray.indexOf(".") + 1,
		scdArray,
	);

	expect(joinedArray).toStrictEqual([
		"hello",
		",",
		" ",
		"mother",
		".",
		" How",
		" are",
		" you",
	]);
});

it("should return a new array with an item replaced at a given index", () => {
	const array = Object.freeze(["h", "e", "l", "1", "o"]);

	const newArray = replace(array, array.indexOf("1"), "l");

	expect(newArray).toStrictEqual(["h", "e", "l", "l", "o"]);
});

it("should return a new reversed array", () => {
	const array = Object.freeze([1, 2, 3, 4, 5]);

	const reversedArray = reverse(array);

	expect(reversedArray).toStrictEqual([5, 4, 3, 2, 1]);
});

it("should return a new array with an item removed", () => {
	const array = Object.freeze([1, 2, 3, 9, 4, 5]);

	const newArray = remove(array, array.indexOf(9));

	expect(newArray).toStrictEqual([1, 2, 3, 4, 5]);
});

it("should return a new array without the first item", () => {
	const array = Object.freeze([1, 2, 3, 4]);

	const shiftedArray = shift(array);

	expect(shiftedArray).toStrictEqual([2, 3, 4]);
});

it("should return a new array with a new item", () => {
	const arr = Object.freeze([1, 2, 3]);

	const newArray = push(arr, 4);

	expect(newArray).toStrictEqual([1, 2, 3, 4]);
});

it("should return a new sorted array", () => {
	const unsortedArray = Object.freeze([4, 6, 8, 1, 9]);

	const sortedArray = sort(unsortedArray);

	expect(sortedArray).toStrictEqual([1, 4, 6, 8, 9]);
});

it("should return a new array without the last item", () => {
	const arr = [1, 2, 3, 4];

	const newArray = pop(arr);

	expect(newArray).toStrictEqual([1, 2, 3]);
});
