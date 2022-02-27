const { random, floor } = Math;

/** [min, max) */
export const getRandomInt = (min: number, max: number) => {
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
	throw new Error(
		`I shouldn't get here (on 'assertUnreachable')!\nreceived = ${received}`,
	);
};
