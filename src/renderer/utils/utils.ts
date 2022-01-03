export const getRandom = (min: number, max: number) =>
	Math.random() * (max - min) + min;

/** [min, max) */
export const getRandomInt = (min: number, max: number) =>
	Math.floor(min + Math.random() * (max - min));

export const capitalize = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertUnreachable = (_: never): never => {
	throw new Error("Didn't expect to get here");
};
