import type { Media, Path } from "@common/@types/generalTypes";
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

export function sortByDateOfBirth(list: MainList): [Path, Media][] {
	const listAsArrayOfPaths = [...list].sort(
		([, { birthTime: prevBirthTime }], [, { birthTime: nextBirthTime }]) =>
			prevBirthTime > nextBirthTime
				? 1
				: prevBirthTime < nextBirthTime
				? -1
				: 0,
	);

	return listAsArrayOfPaths;
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function sortByTitle(list: MainList): [Path, Media][] {
	const listAsArrayOfPaths = [...list].sort(
		([, { title: prevTitle }], [, { title: nextTitle }]) => {
			prevTitle = prevTitle.toLowerCase();
			nextTitle = nextTitle.toLowerCase();

			return prevTitle > nextTitle ? 1 : prevTitle < nextTitle ? -1 : 0;
		},
	);

	return listAsArrayOfPaths;
}
