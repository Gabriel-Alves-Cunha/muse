import type { MainList } from "./usePlaylists";
import type { ID } from "@common/@types/generalTypes";

import { log } from "@utils/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const getMediaFiles = (fileList: FileList): readonly File[] => {
	const supportedFiles: File[] = [];

	for (const file of fileList) {
		// Faster than regex:
		if (!(file.type.includes("audio") || file.type.includes("video"))) continue;

		log(file);

		supportedFiles.push(file);
	}

	return supportedFiles;
};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const sortByDate = (list: MainList): ReadonlySet<ID> => {
	const listAsArrayOfPaths = Array.from(list)
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
};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const sortByTitle = (list: MainList): MainList => {
	const listAsArrayOfPaths = Array.from(list).sort(
		([, { title: prevTitle }], [, { title: nextTitle }]) => {
			prevTitle = prevTitle.toLowerCase();
			nextTitle = nextTitle.toLowerCase();

			return prevTitle > nextTitle ? 1 : prevTitle < nextTitle ? -1 : 0;
		},
	);

	return new Map(listAsArrayOfPaths);
};
