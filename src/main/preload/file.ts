import type { Path } from "@common/@types/generalTypes";

import { readdir, unlink, access } from "node:fs/promises";
import { join } from "node:path";

import { emptyArray } from "@common/empty";

const { error } = console;

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

/** Infallible async function. */
export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Path,
): Promise<readonly Path[]> {
	const files = await readDir(dir);

	const fullPaths: Path[] = [];

	for (const file of files) fullPaths.push(join(dir, file));

	return fullPaths;
}

///////////////////////////////////////////

/** Infallible async function. */
export async function readDir(dir: Path): Promise<readonly Path[]> {
	return await readdir(dir).catch((err) => {
		error(err);
		return emptyArray;
	});
}

///////////////////////////////////////////

/** Infallible async function. */
export async function deleteFile(path: Path): Promise<boolean> {
	return unlink(path)
		.then(() => true)
		.catch((err) => {
			error(err);
			return false;
		});
}

///////////////////////////////////////////

/** Infallible async function. */
export async function doesPathExists(path: Path): Promise<boolean> {
	return access(path)
		.then(() => true)
		.catch(() => false);
}
