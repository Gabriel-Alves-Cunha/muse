import { dbg } from "@common/utils";

const { random, floor } = Math;

/** [min, max) */
export const getRandomInt = (min: number, max: number): number => {
	if (!Number.isFinite(min)) {
		console.error(
			`Function \`getRandomInt\` received \`min = ${min}\` wich is not a finite number!`,
		);

		min = 0;
	}
	if (!Number.isFinite(max)) {
		console.error(
			`Function \`getRandomInt\` received \`max = ${max}\` wich is not a finite number!`,
		);

		max = 1;
	}

	return floor(min + random() * (max - min));
};

export const capitalize = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1);

export const assertUnreachable = (received: never): never => {
	const error = JSON.stringify(received, null, 2) ?? received;

	throw new Error(
		"I shouldn't get here (on 'assertUnreachable')!\nreceived = " + error,
	);
};

export const time = <T>(fn: () => T, fnName: string): T => {
	const start = performance.now();

	const fnReturn = fn();

	const end = performance.now();

	dbg(
		`%cFunction %c"${fnName}" %ctook: ${end - start} ms.`,
		"color:brown",
		"color:blue",
		"color:brown",
	);

	return fnReturn;
};
