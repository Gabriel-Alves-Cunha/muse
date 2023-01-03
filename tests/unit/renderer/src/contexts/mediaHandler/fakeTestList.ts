import type { ID, Media } from "@common/@types/generalTypes";

import { randomUUID } from "node:crypto";

import { formatDuration } from "@common/utils";

const { sortByTitle } = await import("@contexts/usePlaylistsHelper");

// Make a test list full of fake medias:
export const numberOfMedias = 30;

// Make a test list full of fake medias sorted by path:
export const testMap: ReadonlyMap<ID, Media> = sortByTitle(
	new Map(
		Array.from({ length: numberOfMedias }, (_: undefined, index) => {
			const title = `Test Title - ${index}`;
			const media: Media = {
				duration: formatDuration(index + 10),
				birthTime: Date.now(),
				path: `${index}`,
				size: 3_000,
				genres: [],
				artist: "",
				lyrics: "",
				album: "",
				image: "",
				title,
			};

			return [randomUUID(), media] as const;
		}),
	),
);

export const arrayFromMainList = Object.freeze([...testMap]);

export const lastMediaIDFromTestArray = arrayFromMainList.at(-1)![0];
export const lastMediaIDFromMainList = arrayFromMainList.at(-1)![0];
export const firstMediaIDFromTestArray = arrayFromMainList[0]![0];
export const firstMediaIDFromMainList = arrayFromMainList[0]![0];
