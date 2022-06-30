import type { Path } from "@common/@types/generalTypes";

import { join } from "node:path";
import {
	readFile as fsReadFile,
	readdir as fsReadDir,
	unlink,
} from "node:fs/promises";

export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Readonly<Path>,
): Promise<readonly Path[]> {
	return (await readdir(dir).catch(err => {
		console.error(err);
		return [];
	}))
		.map(filename => join(dir, filename));
}

export async function readFile(
	path: Readonly<Path>,
): Promise<Readonly<Buffer | undefined>> {
	return await fsReadFile(path).catch(err => {
		console.error(err);
		return undefined;
	});
}

export async function readdir(dir: Readonly<Path>): Promise<readonly Path[]> {
	return await fsReadDir(dir).catch(err => {
		console.error(err);
		return [];
	});
}

export async function deleteFile(
	path: Readonly<Path>,
): Promise<Readonly<boolean>> {
	return unlink(path).then(() => true).catch(err => {
		console.error(err);
		return false;
	});
}
