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

export function sortByDate(list: MainList): ReadonlySet<Path> {
	const listAsArrayOfPaths = Array.from(list)
		.sort(([, prevMedia], [, nextMedia]) => {
			if (prevMedia.birthTime > nextMedia.birthTime) return 1;
			if (prevMedia.birthTime < nextMedia.birthTime) return -1;
			// a must be equal to b:
			return 0;
		})
		.map(([path]) => path);

	return new Set(listAsArrayOfPaths);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function sortByName(list: MainList): MainList {
	const listAsArrayOfPaths = Array.from(list).sort(
		([, prevMedia], [, nextMedia]) => {
			const prevTitle = prevMedia.title.toLocaleLowerCase();
			const nextTitle = nextMedia.title.toLocaleLowerCase();

			if (prevTitle > nextTitle) return 1;
			if (prevTitle < nextTitle) return -1;
			// a must be equal to b:
			return 0;
		},
	);

	return new Map(listAsArrayOfPaths);
}
