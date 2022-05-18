import type { Path } from "@common/@types/generalTypes";

import { join } from "node:path";
import {
	readFile as fsReadFile,
	readdir as fsReadDir,
	unlink,
} from "node:fs/promises";

export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Readonly<Path>
): Promise<readonly Path[]> {
	return (await readdir(dir)).map(filename => join(dir, filename));
}

export async function readFile(
	path: Readonly<Path>
): Promise<Readonly<Buffer>> {
	return await fsReadFile(path);
}

export async function readdir(dir: Readonly<Path>): Promise<readonly Path[]> {
	return await fsReadDir(dir);
}

export async function deleteFile(path: Readonly<Path>): Promise<void> {
	await unlink(path);
}
