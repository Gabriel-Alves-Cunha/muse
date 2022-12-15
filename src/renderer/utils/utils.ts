import { stringifyJson } from "@common/utils";
import { dbg } from "@common/debug";

const { random, floor } = Math;

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

/** [min, max) */
export const getRandomInt = (min: number, max: number): number => {
	if (!(isFinite(min) && isFinite(max)))
		throw new Error(
			`\`getRandomInt()\` can't handle infinite numbers. Received \`min = ${min}\` and \`max = ${max}\`.`,
		);

	return floor(min + random() * (max - min));
};

//////////////////////////////////////////

export const capitalize = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1);

//////////////////////////////////////////

export const assertUnreachable = (received: never): never => {
	const error = stringifyJson(received) ?? received;

	throw new Error(
		"I shouldn't get here (on 'assertUnreachable')!\nreceived = " + error,
	);
};

//////////////////////////////////////////

export function time<T>(fn: () => T, label: string): T {
	const start = performance.now();

	const fnReturn = fn();

	const end = performance.now();

	dbg(
		`%cFunction %c"${label}" %ctook: ${end - start} ms.`,
		"color: brown",
		"color: blue",
		"color: brown",
	);

	return fnReturn;
}

// export function timeit(label = "") {
// 	return function (
// 		target: unknown,
// 		propertyKey: string,
// 		descriptor: PropertyDescriptor,
// 	) {
// 		console.log(
// 			"target =",
// 			target,
// 			"\npropertyKey =",
// 			propertyKey,
// 			"\ndescriptor =",
// 			descriptor,
// 		);
//
// 		const start = performance.now();
//
// 		const fnReturn = target();
//
// 		const time = performance.now() - start;
//
// 		dbg(
// 			`%cFunction %c"${label}" %ctook: ${time} ms.`,
// 			"color: brown",
// 			"color: blue",
// 			"color: brown",
// 		);
//
// 		return fnReturn;
// 	};
// }
//
// const pow2 = (a: number, b: number): number => (a ** b) ** b;
//
// @timeit("pow")
// pow2(489, 9);
