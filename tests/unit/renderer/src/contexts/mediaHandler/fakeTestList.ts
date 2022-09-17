import type { Media } from "@common/@types/generalTypes";

import { formatDuration } from "@common/utils";
import { emptyString } from "@common/empty";

// Make a test list full of fake medias:
export const numberOfMedias = 30;

// Make a test list full of fake medias sorted by path:
export const testArray = Object.freeze(
	Array
		.from({ length: numberOfMedias }, (_, index) => {
			const title = `Test Title - ${index}`;
			const media: Media = {
				duration: formatDuration(index + 10),
				birthTime: Date.now(),
				artist: emptyString,
				lyrics: emptyString,
				album: emptyString,
				image: emptyString,
				size: 3_000,
				genres: [],
				title,
			};

			return [`home/Music/test/${title}.mp3`, media] as const;
		})
		.sort((a, b) => a[0].localeCompare(b[0])),
);

export const testList: ReadonlyMap<string, Media> = Object.freeze(
	new Map(testArray),
);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const lastMediaPath = testArray.at(-1)![0];
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const firstMediaPath = testArray[0]![0];
