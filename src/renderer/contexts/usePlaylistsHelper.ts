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
				prevTitle.localeCompare(nextTitle, undefined, {
					ignorePunctuation: true,
					sensitivity: "base",
				}),
		);

		return new Map(listAsArrayOfPaths);
	}, "sortByName");
