/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 */
export function deepMerge(
	...objects: Record<string, unknown>[]
): Record<string, unknown> {
	const isObject = (obj: unknown): obj is Record<string, unknown> =>
		Boolean(obj) && typeof obj === "object";

	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const previousValue = prev[key];
			const objectValue = obj[key];

			if (Array.isArray(previousValue) && Array.isArray(objectValue))
				prev[key] = previousValue.concat(...objectValue);
			else if (isObject(previousValue) && isObject(objectValue))
				prev[key] = deepMerge(previousValue, objectValue);
			else prev[key] = objectValue;
		});

		return prev;
	}, {});
}
