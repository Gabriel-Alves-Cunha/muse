import type { Path } from "@common/@types/generalTypes";

import { readdir, unlink, access } from "node:fs/promises";
import { join } from "node:path";

export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Readonly<Path>,
): Promise<readonly Path[]> {
	return (await readDir(dir).catch(err => {
		console.error(err);
		return [];
	}))
		.map(filename => join(dir, filename));
}

export async function readDir(dir: Readonly<Path>): Promise<readonly Path[]> {
	return await readdir(dir).catch(err => {
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

export async function pathExists(
	path: Readonly<Path>,
): Promise<Readonly<boolean>>
{
	return access(path).then(() => true).catch(() => false);
}
