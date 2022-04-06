import type { Media, Mutable, Path } from "@common/@types/typesAndEnums";

import { allowedMedias, getLastExtension } from "@common/utils";
import { sort, unshift } from "@utils/array";

const {
	fs: { readdir, getFullPathOfFilesForFilesInThisDirectory },
	os: { dirs },
} = electron;

// fns
export const maxSizeOfHistory = 100;
export function returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
	previousHistory: readonly Media[],
	newMedia: Media,
): readonly Media[] {
	// if the newMedia is the same as the first media in the list, don't add it again:
	if (newMedia.id === previousHistory[0]?.id) return previousHistory;

	// add newMedia to the start of array:
	const newHistory: Media[] = reaplyOrderedIndex(
		unshift(previousHistory, newMedia) as Mutable<Media[]>,
	);

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
	const documentsDirectoryPromise = getFullPathOfFilesForFilesInThisDirectory(
		dirs.documents,
	);
	const downloadDirectoryPromise = getFullPathOfFilesForFilesInThisDirectory(
		dirs.downloads,
	);
	const musicDirectoryPromise = getFullPathOfFilesForFilesInThisDirectory(
		dirs.music,
	);
	const _1 = await documentsDirectoryPromise;
	const _2 = await downloadDirectoryPromise;
	const _3 = await musicDirectoryPromise;

	return [_1, _2, _3].flat() as readonly string[];
}

export const searchDirectoryForMedias = async (directory: Path) =>
	getAllowedMedias(await readdir(directory));

export const getAllowedMedias = (
	filenames: readonly string[],
): readonly string[] =>
	filenames.filter(filename =>
		allowedMedias.some(extension => extension === getLastExtension(filename)),
	);

type ListWithOrder<T> = ReadonlyArray<
	Readonly<T> & Readonly<{ index: number }>
>;
export const reaplyOrderedIndex = <T>(list: ListWithOrder<T>) =>
	list.map((item, index) => ({ ...item, index }));

type ListWithDateAndOrder<T> = ReadonlyArray<
	Readonly<T> & Readonly<{ dateOfArival: number; index: number }>
>;

export const sortByDate = <T>(list: ListWithDateAndOrder<T>) =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.dateOfArival > b.dateOfArival) return 1;
			if (a.dateOfArival < b.dateOfArival) return -1;
			// a must be equal to b:
			return 0;
		}),
	);

type ListWithNameAndOrder<T> = ReadonlyArray<
	Readonly<T> & Readonly<{ title: string; index: number }>
>;

export const sortByName = <T>(list: ListWithNameAndOrder<T>) =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.title > b.title) return 1;
			if (a.title < b.title) return -1;
			// a must be equal to b:
			return 0;
		}),
	);

export const SORTED_BY_DATE = "sorted by date";
export const SORTED_BY_NAME = "sorted by name";
export const FAVORITES = "favorites";
export const MEDIA_LIST = "mediaList";
export const HISTORY = "history";
