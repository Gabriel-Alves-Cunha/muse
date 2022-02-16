import type { Media, Path } from "@common/@types/typesAndEnums";

import { allowedMedias, getExtension } from "@common/utils";

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
	if (media.id === previousHistory[0]?.id) return previousHistory;

	const newHistory: Media[] = [media, ...previousHistory];

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

const documentsDirectoryPromise = getFullPathOfFilesForFilesInThisDirectory(
	dirs.documents,
);
const downloadDirectoryPromise = getFullPathOfFilesForFilesInThisDirectory(
	dirs.downloads,
);
const musicDirectoryPromise = getFullPathOfFilesForFilesInThisDirectory(
	dirs.music,
);

export async function searchDirectoryResult() {
	const _1 = await documentsDirectoryPromise;
	const _2 = await downloadDirectoryPromise;
	const _3 = await musicDirectoryPromise;

	const result = [_1, _2, _3].flat() as readonly string[];

	console.log(result);

	return result;
}

export const searchDirectoryForMedias = async (directory: Path) =>
	getAllowedMedias(await readdir(directory));

export const getAllowedMedias = (
	filenames: readonly string[],
): readonly string[] =>
	filenames.filter(filename =>
		allowedMedias.some(extension => extension === getExtension(filename)),
	);

type ListWithOrder<T> = ReadonlyArray<
	Readonly<T> & Readonly<{ index: number }>
>;
export const reaplyOrderedIndex = <T>(list: ListWithOrder<T>) =>
	list.map((item, index) => ({ ...item, index }));
