import { type Path } from "@common/@types/typesAndEnums";

import { join } from "@tauri-apps/api/path";
import {
	removeFile as _removeFile,
	FileEntry,
	readDir,
} from "@tauri-apps/api/fs";

// fs: {
// 	getFullPathOfFilesForFilesInThisDirectory,
// 	removeFile,
// 	readFile,
// 	readdir,
// },

export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Readonly<Path>,
): Promise<readonly Path[]> {
	console.time("getFullPathOfFilesForFilesInThisDirectory");
	const dirs = await readdir(dir);
	const promises = dirs.map(async ({ path }) => await join(dir, path));
	const fullPaths = await Promise.all(promises);
	console.timeEnd("getFullPathOfFilesForFilesInThisDirectory");

	console.log({ fullPaths });

	return fullPaths;
}

export async function readFile(
	path: Readonly<Path>,
): Promise<Readonly<Buffer>> {
	return await readFile(path);
}

export async function readdir(
	dir: Readonly<Path>,
): Promise<readonly FileEntry[]> {
	return await readDir(dir);
}

export async function removeFile(path: Readonly<Path>): Promise<void> {
	await _removeFile(path);
}
