const { random, floor } = Math;

export const getRandom = (min: number, max: number) =>
	random() * (max - min) + min;

/** [min, max) */
export const getRandomInt = (min: number, max: number) =>
	floor(min + random() * (max - min));

export const capitalize = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1);

export const assertUnreachable = (received: never): never => {
	throw new Error(
		`I shouldn't get here (on 'assertUnreachable')!\nreceived = ${received}`,
	);
};
