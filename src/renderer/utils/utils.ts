import { stringifyJson } from "@common/utils";
import { dbg } from "@common/debug";

const { random, floor } = Math;

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

/** [min, max) */
export function getRandomInt(min: number, max: number): number {
	if (!(isFinite(min) && isFinite(max)))
		throw new Error(
			`\`getRandomInt()\` can't handle infinite numbers. Received \`min = ${min}\` and \`max = ${max}\`.`,
		);

	return floor(min + random() * (max - min));
}

//////////////////////////////////////////

export function assertUnreachable(received: never): never {
	const error = stringifyJson(received) ?? received;

	throw new Error(
		"I shouldn't get here (on 'assertUnreachable')!\nreceived = " + error,
	);
}

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
