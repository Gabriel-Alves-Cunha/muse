import type { Path } from "types/generalTypes";

import { readDir } from "@tauri-apps/api/fs";
import { sep } from "@tauri-apps/api/path";

import { allowedMedias, dirs } from "./utils";
import { getLastExtension } from "./path";
import { dbg } from "./log";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

/** Infallible async function. */
export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Path,
): Promise<readonly Path[]> {
	const files = await readDir(dir);

	dbg("files from readDir =", files);

	const fullPaths: Path[] = [];

	for (const { path } of files) fullPaths.push(join(dir, path));

	return fullPaths;
}

///////////////////////////////////////////

export const join = (...paths: Path[]) => paths.join(sep);

export async function searchDirectoryResult(): Promise<readonly Path[]> {
	const resoledPromises = await Promise.allSettled([
		getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
		getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
		getFullPathOfFilesForFilesInThisDirectory(dirs.music),
	]);

	const paths: Path[] = [];

	for (const resolved of resoledPromises)
		if (resolved.status === "fulfilled") paths.push(...resolved.value);

	return paths;
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export async function searchDirectoryForMedias(
	directory: Path,
): Promise<readonly Path[]> {
	const filenames = await getFullPathOfFilesForFilesInThisDirectory(directory);

	return getAllowedMedias(filenames);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const getAllowedMedias = (filenames: readonly Path[]): readonly Path[] =>
	filenames.filter((filename) =>
		allowedMedias.some((extension) => extension === getLastExtension(filename)),
	);
