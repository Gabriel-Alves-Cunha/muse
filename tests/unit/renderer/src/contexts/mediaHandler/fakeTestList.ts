import type { ID, Media } from "@common/@types/generalTypes";

import { randomUUID } from "node:crypto";

import { formatDuration } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";
import { emptyString } from "@common/empty";

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
				artist: emptyString,
				lyrics: emptyString,
				album: emptyString,
				image: emptyString,
				path: `${index}`,
				size: 3_000,
				genres: [],
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
