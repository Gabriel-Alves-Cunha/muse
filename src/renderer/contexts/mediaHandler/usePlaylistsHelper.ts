import type { MainList } from "./usePlaylists";
import type { Path } from "@common/@types/generalTypes";

import { allowedMedias, getLastExtension } from "@common/utils";
import { time } from "@utils/utils";

const {
	fs: { readdir, getFullPathOfFilesForFilesInThisDirectory },
	os: { dirs },
} = electron;

export function getMediaFiles(fileList: Readonly<FileList>): readonly File[] {
	const supportedFiles: File[] = [];

	for (const file of fileList) {
		// Faster than regex:
		if (!file.type.includes("audio") && !file.type.includes("video")) continue;

		console.log(file);

		supportedFiles.push(file);
	}

	return supportedFiles;
}

export const searchDirectoryResult = async () =>
	time(
		async () =>
			(
				await Promise.allSettled([
					getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
					getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
					getFullPathOfFilesForFilesInThisDirectory(dirs.music),
				])
			)
				.map(p => (p.status === "fulfilled" ? p.value : undefined))
				.filter(Boolean)
				.flat() as readonly string[],
		"searchDirectoryResult",
	);

export const searchDirectoryForMedias = async (directory: string) =>
	getAllowedMedias(await readdir(directory));

export const getAllowedMedias = (
	filenames: readonly string[],
): readonly string[] =>
	filenames.filter(name =>
		allowedMedias.some(ext => ext === getLastExtension(name)),
	);

export const sortByDate = (list: MainList): Set<Path> => {
	const listAsArrayOfPaths = Array.from(list)
		.sort(([, prevMedia], [, nextMedia]) => {
			if (prevMedia.dateOfArival > nextMedia.dateOfArival) return 1;
			if (prevMedia.dateOfArival < nextMedia.dateOfArival) return -1;
			// a must be equal to b:
			return 0;
		})
		.map(([path]) => path);

	return new Set(listAsArrayOfPaths);
};

export const sortByName = (list: MainList) => {
	const listAsArrayOfPaths = Array.from(list)
		.sort(([, prevMedia], [, nextMedia]) => {
			if (prevMedia.title > nextMedia.title) return 1;
			if (prevMedia.title < nextMedia.title) return -1;
			// a must be equal to b:
			return 0;
		})
		.map(([path]) => path);

	return new Set(listAsArrayOfPaths);
};
