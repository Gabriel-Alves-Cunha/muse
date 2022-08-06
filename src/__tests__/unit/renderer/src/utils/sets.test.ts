import { test } from "vitest";

import { setDifference } from "@utils/sets";

test("Test set difference.", () => {
	const smallSetA = new Set(),
		smallSetB = new Set(),
		mediumSetA = new Set(),
		mediumSetB = new Set(),
		largeSetA = new Set(),
		largeSetB = new Set();

	for (let i = 0; i < 50; ++i) {
		if (i % 2 !== 0) smallSetA.add(i);
		if (i % 3 !== 0) smallSetB.add(i);
	}

	for (let i = 0; i < 500; ++i) {
		if (i % 2 !== 0) mediumSetA.add(i);
		if (i % 3 !== 0) mediumSetB.add(i);
	}

	for (let i = 0; i < 5_000; ++i) {
		if (i % 2 !== 0) largeSetA.add(i);
		if (i % 3 !== 0) largeSetB.add(i);
	}

	console.time("Small set");
	const res1 = setDifference(smallSetA, smallSetB);
	console.timeEnd("Small set");
	console.log("Small set result =", res1);

	console.time("Medium set");
	setDifference(mediumSetA, mediumSetB);
	console.timeEnd("Medium set");

	console.time("Large set");
	setDifference(largeSetA, largeSetB);
	console.timeEnd("Large set");
});
