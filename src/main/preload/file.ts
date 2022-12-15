import type { Path } from "@common/@types/generalTypes";

import { readdir, unlink } from "node:fs/promises";
import { error } from "node:console";
import { join } from "node:path";

import { getLastExtension } from "@common/path";
import { allowedMedias } from "@common/utils";
import { emptyArray } from "@common/empty";
import { dirs } from "@main/utils";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

/** Infallible async function. */
export const getFullPathOfFilesForFilesInThisDirectory = async (
	dir: Path,
): Promise<readonly Path[]> => {
	const files = await readDir(dir);

	const fullPaths: Path[] = [];

	for (const file of files) fullPaths.push(join(dir, file));

	return fullPaths;
};

///////////////////////////////////////////

/** Infallible async function. */
export const readDir = async (dir: Path): Promise<readonly Path[]> =>
	await readdir(dir).catch((err) => {
		error(err);
		return emptyArray;
	});

///////////////////////////////////////////

/** Infallible async function. */
export const deleteFile = (path: Path): Promise<boolean> =>
	unlink(path)
		.then(() => true)
		.catch((err) => {
			error(err);
			return false;
		});

export const searchDirectoryResult = async (): Promise<readonly Path[]> => {
	const resoledPromises = await Promise.allSettled([
		getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
		getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
		getFullPathOfFilesForFilesInThisDirectory(dirs.music),
	]);

	const paths: Path[] = [];

	for (const resolved of resoledPromises)
		if (resolved.status === "fulfilled") paths.push(...resolved.value);

	return paths;
};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const searchDirectoryForMedias = async (
	directory: Path,
): Promise<readonly Path[]> => getAllowedMedias(await readDir(directory));

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const getAllowedMedias = (filenames: readonly Path[]): readonly Path[] =>
	filenames.filter((filename) =>
		allowedMedias.some((extension) => extension === getLastExtension(filename)),
	);
