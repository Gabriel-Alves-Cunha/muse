import type { MainList } from "./usePlaylists";
import type { Path } from "@common/@types/generalTypes";

import { getLastExtension } from "@common/path";
import { allowedMedias } from "@common/utils";
import { time } from "@utils/utils";
import { log } from "@utils/log";

const {
	fs: { readDir, getFullPathOfFilesForFilesInThisDirectory },
	os: { dirs },
} = electron;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function getMediaFiles(fileList: FileList): readonly File[] {
	const supportedFiles: File[] = [];

	for (const file of fileList) {
		// Faster than regex:
		if (!(file.type.includes("audio") || file.type.includes("video"))) continue;

		log(file);

		supportedFiles.push(file);
	}

	return supportedFiles;
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const searchDirectoryResult = async (): Promise<readonly Path[]> =>
	await time(async () => {
		const resoledPromises = await Promise.allSettled([
			getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
			getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
			getFullPathOfFilesForFilesInThisDirectory(dirs.music),
		]);

		const paths: Path[] = [];

		for (const resolved of resoledPromises)
			if (resolved.status === "fulfilled") paths.push(...resolved.value);

		return paths;
	}, "searchDirectoryResult");

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
	filenames.filter((name) =>
		allowedMedias.some((ext) => ext === getLastExtension(name)),
	);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const sortByDate = (list: MainList): Set<Path> =>
	time(() => {
		const listAsArrayOfPaths = [...list]
			.sort(
				([, { birthTime: prevBirthTime }], [, { birthTime: nextBirthTime }]) =>
					prevBirthTime > nextBirthTime
						? 1
						: prevBirthTime < nextBirthTime
						? -1
						: 0,
			)
			.map(([path]) => path);

		return new Set(listAsArrayOfPaths);
	}, "sortByDate");

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const sortByName = (list: MainList): MainList =>
	time(() => {
		const listAsArrayOfPaths = [...list].sort(
			([, { title: prevTitle }], [, { title: nextTitle }]) =>
				compare(prevTitle, nextTitle),
		);

		return new Map(listAsArrayOfPaths);
	}, "sortByName by fast compare() function");

/**
 * Compare two strings. This comparison is not linguistically accurate, unlike
 * String.prototype.localeCompare(), albeit stable.
 *
 * @returns -1, 0 or 1
 */
export function compare(a: string, b: string) {
	const lenA = a.length;
	const lenB = b.length;

	const minLen = lenA < lenB ? lenA : lenB;

	for (let i = 0; i < minLen; ++i) {
		const ca = a.charCodeAt(i);
		const cb = b.charCodeAt(i);

		if (ca > cb) return 1;
		if (ca < cb) return -1;
	}

	if (lenA === lenB) return 0;

	return lenA > lenB ? 1 : -1;
}
