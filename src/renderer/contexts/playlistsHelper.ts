import type { Media, Path } from "@common/@types/GeneralTypes";
import type { MainList } from "./playlists";

import { log } from "@common/log";

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

export function sortByDateOfBirth(
	mutableList: [Path, Media][],
): Readonly<[Path, Media][]> {
	const sortedList = mutableList.sort(
		([, { birthTime: prevBirthTime }], [, { birthTime: nextBirthTime }]) =>
			prevBirthTime > nextBirthTime
				? 1
				: prevBirthTime < nextBirthTime
				? -1
				: 0,
	);

	return sortedList;
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function sortByTitle(
	mutableList: [Path, Media][],
): Readonly<[Path, Media][]> {
	const sortedList = mutableList.sort(
		([, { title: prevTitle }], [, { title: nextTitle }]) => {
			prevTitle = prevTitle.toLowerCase();
			nextTitle = nextTitle.toLowerCase();

			return prevTitle > nextTitle ? 1 : prevTitle < nextTitle ? -1 : 0;
		},
	);

	return sortedList;
}
