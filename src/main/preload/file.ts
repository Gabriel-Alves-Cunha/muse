import type { Path } from "@common/@types/generalTypes";

import { readdir, unlink, access } from "node:fs/promises";
import { join } from "node:path";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

/** Infallible async function. */
export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Path,
): Promise<readonly Path[]> {
	return (
		await readDir(dir).catch((err) => {
			console.error(err);
			return [];
		})
	).map((filename) => join(dir, filename));
}

///////////////////////////////////////////

/** Infallible async function. */
export async function readDir(dir: Path): Promise<readonly Path[]> {
	return await readdir(dir).catch((err) => {
		console.error(err);
		return [];
	});
}

///////////////////////////////////////////

/** Infallible async function. */
export async function deleteFile(path: Path): Promise<boolean> {
	return unlink(path)
		.then(() => true)
		.catch((err) => {
			console.error(err);
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
