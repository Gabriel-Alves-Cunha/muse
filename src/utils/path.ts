import type { Path } from "types/generalTypes";

/**
 * These are not a bulletproof fns, but for the purpose of
 * getting the allowedMedias, it is ok, faster than NodeJS's.
 */
export const getBasename = (filename: Path): string =>
	filename.split("\\").pop()?.split("/").pop()?.split(".")[0] ?? "";

/////////////////////////////////////////

export function getPathWithoutExtension(filename: Path): string {
	const index =
		filename.indexOf(".") === -1 ? filename.length : filename.indexOf(".");

	return filename.slice(0, index);
}

/////////////////////////////////////////

/**
 * This doesn't handle files with only extensions,
 * e.g.: '.gitignore' will result in ''.
 */
export const getLastExtension = (filename: Path): string =>
	filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);

/////////////////////////////////////////

export const getBasenameAndLastExtension = (
	filename: Path,
): readonly [string, string] => [
	getBasename(filename),
	getLastExtension(filename),
];
