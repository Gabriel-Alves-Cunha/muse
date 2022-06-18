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
			(await Promise.allSettled([
				getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
				getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
				getFullPathOfFilesForFilesInThisDirectory(dirs.music),
			])).map(p => (p.status === "fulfilled" ? p.value : undefined)).filter(
				Boolean,
			).flat() as readonly string[],
		"searchDirectoryResult",
	);

export const searchDirectoryForMedias = async (directory: string) =>
	getAllowedMedias(await readdir(directory));

export const getAllowedMedias = (
	filenames: readonly string[],
): readonly string[] =>
	filenames.filter(name =>
		allowedMedias.some(ext => ext === getLastExtension(name))
	);

export function sortByDate(list: MainList): ReadonlySet<Path> {
	const listAsArrayOfPaths = [...list].sort(([, prevMedia], [, nextMedia]) => {
		if (prevMedia.birthTime > nextMedia.birthTime) return 1;
		if (prevMedia.birthTime < nextMedia.birthTime) return -1;
		// a must be equal to b:
		return 0;
	}).map(([path]) => path);

	return new Set(listAsArrayOfPaths);
}

export function sortByName(list: MainList): MainList {
	const listAsArrayOfPaths = [...list].sort(([, prevMedia], [, nextMedia]) => {
		const prevTitle = prevMedia.title.toLocaleLowerCase();
		const nextTitle = nextMedia.title.toLocaleLowerCase();

		if (prevTitle > nextTitle) return 1;
		if (prevTitle < nextTitle) return -1;
		// a must be equal to b:
		return 0;
	});

	return new Map(listAsArrayOfPaths);
}
