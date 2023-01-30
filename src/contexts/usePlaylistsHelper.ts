import type { MainList } from "./usePlaylists";
import type { Path } from "@renderer/common/@types/generalTypes";

import { log } from "@renderer/common/log";

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

export function sortByDateOfBirth(list: MainList): ReadonlySet<Path> {
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
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function sortByTitle(list: MainList): MainList {
	const listAsArrayOfPaths = [...list].sort(
		([, { title: prevTitle }], [, { title: nextTitle }]) => {
			prevTitle = prevTitle.toLowerCase();
			nextTitle = nextTitle.toLowerCase();

			return prevTitle > nextTitle ? 1 : prevTitle < nextTitle ? -1 : 0;
		},
	);

	return new Map(listAsArrayOfPaths);
}
