import { stringifyJson } from "@common/utils";
import { throwErr } from "@common/log";
import { dbg } from "@common/debug";

const { random, floor } = Math;

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

/** [min, max) */
export const getRandomInt = (min: number, max: number): number => {
	if (!(isFinite(min) && isFinite(max)))
		throwErr(
			`\`getRandomInt()\` can't handle infinite numbers. Received \`min = ${min}\` and \`max = ${max}\`.`,
		);

	return floor(min + random() * (max - min));
};

//////////////////////////////////////////

export const capitalize = (str: string): string =>
	`${str.charAt(0).toUpperCase()}${str.slice(1)}`;

//////////////////////////////////////////

export const assertUnreachable = (received: never): never => {
	const error = stringifyJson(received) ?? received;

	throw throwErr(
		"I shouldn't get here (on 'assertUnreachable')!\nreceived = " + error,
	);
};

//////////////////////////////////////////

export const time = <T>(fn: () => T, label: string): T => {
	const start = performance.now();

	const fnReturn = fn();

	const ms = performance.now() - start;

	dbg(
		`%cFunction %c"${label}" %ctook: ${ms} ms.`,
		"color: brown",
		"color: blue",
		"color: brown",
	);

	return fnReturn;
};
