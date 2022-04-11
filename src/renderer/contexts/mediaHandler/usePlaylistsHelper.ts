import type {
	MediaID,
	Mutable,
	Media,
	Path,
} from "@common/@types/typesAndEnums";

import { allowedMedias, getLastExtension } from "@common/utils";
import { sort, unshift } from "@utils/array";

const {
	fs: { readdir, getFullPathOfFilesForFilesInThisDirectory },
	os: { dirs },
} = electron;

// fns
export const maxSizeOfHistory = 100;
export function returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
	previousHistory: readonly MediaID[],
	newMediaID: MediaID,
): readonly MediaID[] {
	// if the newMedia is the same as the first media in the list, don't add it again:
	if (newMediaID === previousHistory[0]) return previousHistory;

	// add newMedia to the start of array:
	const newHistory: MediaID[] = unshift(previousHistory, newMediaID) as Mutable<
		MediaID[]
	>;

	// history has a max size of maxSizeOfHistory:
	if (newHistory.length > maxSizeOfHistory)
		newHistory.length = maxSizeOfHistory;

	return newHistory;
}

export function getMediaFiles(fileList: Readonly<FileList>): readonly File[] {
	const supportedFiles: File[] = [];

	for (const file of fileList) {
		// Faster than regex:
		if (file.type.indexOf("audio") === -1 && file.type.indexOf("video") === -1)
			continue;

		console.log(file);

		supportedFiles.push(file);
	}

	return supportedFiles;
}

export async function searchDirectoryResult() {
	const fullPaths: Array<readonly string[]> = [];
	console.time("searchDirectoryResult");
	(
		await Promise.allSettled([
			getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
			getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
			getFullPathOfFilesForFilesInThisDirectory(dirs.music),
		])
	).forEach(p => {
		if (p.status === "fulfilled") fullPaths.push(p.value);
	});
	console.timeEnd("searchDirectoryResult");

	return fullPaths.flat();
}

export const searchDirectoryForMedias = async (directory: Path) =>
	getAllowedMedias(await readdir(directory));

export const getAllowedMedias = (
	filenames: readonly string[],
): readonly string[] =>
	filenames.filter(filename =>
		allowedMedias.some(extension => extension === getLastExtension(filename)),
	);

export const sortByDate = (newList: readonly Media[]) =>
	sort(newList, (a, b) => {
		if (a.dateOfArival > b.dateOfArival) return 1;
		if (a.dateOfArival < b.dateOfArival) return -1;
		// a must be equal to b:
		return 0;
	}).map(media => media.id);

export const sortByName = (list: readonly Media[]) =>
	sort(list, (a, b) => {
		if (a.title > b.title) return 1;
		if (a.title < b.title) return -1;
		// a must be equal to b:
		return 0;
	}).map(media => media.id);

export const SORTED_BY_DATE = "sorted by date";
export const SORTED_BY_NAME = "sorted by name";
export const FAVORITES = "favorites";
export const MAIN_LIST = "main list";
export const HISTORY = "history";
