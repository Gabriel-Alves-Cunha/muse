import type { Media, Path } from "@common/@types/GeneralTypes";
import type { Playlists } from "./playlists";

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
	list: Playlists["sortedByTitleAndMainList"],
): [Path, Media][] {
	const sorted = [...list].sort(
		([, { birthTime: prevBirthTime }], [, { birthTime: nextBirthTime }]) =>
			prevBirthTime > nextBirthTime
				? 1
				: prevBirthTime < nextBirthTime
				? -1
				: 0,
	);

	return sorted;
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function sortByTitle(
	list: Playlists["sortedByTitleAndMainList"] | [Path, Media][],
): Playlists["sortedByTitleAndMainList"] {
	const newList: [Path, Media][] =
		list instanceof Map ? [...list] : (list as [Path, Media][]);

	const sorted = new Map(
		newList.sort(([, { title: prevTitle }], [, { title: nextTitle }]) => {
			prevTitle = prevTitle.toLowerCase();
			nextTitle = nextTitle.toLowerCase();

			return prevTitle > nextTitle ? 1 : prevTitle < nextTitle ? -1 : 0;
		}),
	);

	return sorted;
}
