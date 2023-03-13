export function areObjectsEqual(obj_1: Obj, obj_2: Obj): boolean {
	const obj_2_lenght = getObjectLength(obj_2);
	const obj_1_lenght = getObjectLength(obj_1);

	if (obj_1_lenght !== obj_2_lenght) return false;

	for (const key in obj_1) if (obj_1[key] !== obj_2[key]) return false;

	return true;
}

//////////////////////////////////////////

export const getObjectDeepKeys = (obj: Obj): string[] =>
	Object.keys(obj)
		.filter((key) => obj[key] instanceof Object)
		.map((key) => getObjectDeepKeys(obj[key] as Obj).map((k) => `${key}.${k}`))
		.reduce((x, y) => x.concat(y), Object.keys(obj));

//////////////////////////////////////////

export function getObjectLength(obj: Obj): number {
	let length = 0;

	for (const _ in obj) ++length;

	return length;
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Types:

type Obj<T = unknown> = Record<string, T>;
