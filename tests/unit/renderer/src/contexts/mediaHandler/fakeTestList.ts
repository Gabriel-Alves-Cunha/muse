import type { Path, Media } from "@common/@types/generalTypes";

import { sortByTitle } from "@contexts/playlistsHelper";
import { formatDuration } from "@common/utils";

// Make a test list full of fake medias:
export const numberOfMedias = 30;

// Make a test list full of fake medias sorted by path:
export const testMap: Map<Path, Media> = Object.freeze(
	new Map(
		sortByTitle(
			new Map(
				Array.from({ length: numberOfMedias }, (_: undefined, index) => {
					const title = `Test Title - ${index}`;
					const media: Media = {
						duration: formatDuration(index + 10),
						lastModified: Date.now(),
						birthTime: Date.now(),
						size: 3_000,
						genres: [],
						artist: "",
						lyrics: "",
						album: "",
						image: "",
						title,
					};

					return [`~/Music/${title}`, media] as const;
				}),
			),
		),
	),
);

export const arrayFromMainList = Object.freeze([...testMap]);

export const lastMediaPathFromTestArray = arrayFromMainList.at(-1)![0];
export const lastMediaPathFromMainList = arrayFromMainList.at(-1)![0];
export const firstMediaPathFromTestArray = arrayFromMainList[0]![0];
export const firstMediaPathFromMainList = arrayFromMainList[0]![0];
