import { emptyString } from "./empty";

/**
 * These are not a bulletproof fns, but for the purpose of
 * getting the allowedMedias, it is ok, faster than NodeJS's.
 */
export function getBasename(filename: Readonly<string>): Readonly<string> {
	return filename.split("\\").pop()?.split("/").pop()?.split(".")[0] ??
		emptyString;
}

/////////////////////////////////////////

export function getPathWithoutExtension(
	filename: Readonly<string>,
): Readonly<string> {
	const lastIndex = filename.indexOf(".") === -1 ?
		filename.length :
		filename.indexOf(".");

	return filename.slice(0, lastIndex);
}

/////////////////////////////////////////

/**
 * This doesn't handle files with only extensions,
 * e.g.: '.gitignore' will result in ''.
 */
export function getLastExtension(filename: Readonly<string>): Readonly<string> {
	return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/////////////////////////////////////////

export function getBasenameAndExtension(
	filename: Readonly<string>,
): Readonly<[string, string]> {
	return [getBasename(filename), getLastExtension(filename)] as const;
}
