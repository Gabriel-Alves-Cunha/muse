export function shallowEqual(object1: Obj, object2: Obj) {
	const object2Lenght = Object.keys(object2).length;
	const keys1 = Object.keys(object1);

	if (keys1.length !== object2Lenght) return false;

	for (const key of keys1) if (object1[key] !== object2[key]) return false;

	return true;
}

export function objectDeepKeys(obj: Obj): string[] {
	return Object.keys(obj)
		.filter(key => obj[key] instanceof Object)
		.map(key => objectDeepKeys(obj[key] as Obj).map(k => `${key}.${k}`))
		.reduce((x, y) => x.concat(y), Object.keys(obj));
}

type Obj = Record<string, unknown>;
