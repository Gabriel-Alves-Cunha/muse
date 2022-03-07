import type { Media, Mutable, Path } from "@common/@types/typesAndEnums";

import { allowedMedias, getLastExtension } from "@common/utils";
import { push } from "@utils/array";

const {
	fs: { readdir, getFullPathOfFilesForFilesInThisDirectory },
	os: { dirs },
} = electron;

// fns
const maxSizeOfHistory = 100;
export function returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
	previousHistory: readonly Media[],
	media: Media,
): readonly Media[] {
	if (media.id === previousHistory.slice(-1)[0]?.id) return previousHistory;

	const newHistory: Media[] = push(previousHistory, media) as Mutable<Media[]>;

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

export const SORTED_BY_DATE = "sorted by date";
export const SORTED_BY_NAME = "sorted by name";
export const FAVORITES = "favorites";
export const MEDIA_LIST = "mediaList";
export const HISTORY = "history";
