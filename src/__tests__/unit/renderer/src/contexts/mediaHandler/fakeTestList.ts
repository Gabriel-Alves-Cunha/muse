import type { Media } from "@common/@types/generalTypes";

import { formatDuration } from "@common/utils";

// Make a test list full of fake medias:
export const numberOfMedias = 30;
export const testArray = Object.freeze(
	Array.from({ length: numberOfMedias }, (_, index) => {
		const title = `Test Title - ${index}`;
		const media: Media = {
			duration: formatDuration(index + 10),
			birthTime: Date.now(),
			size: "3.0 MB",
			title,
		};

		return [`home/Music/test/${title}.mp3`, media] as const;
	}),
);
export const testList: ReadonlyMap<string, Media> = Object.freeze(
	new Map(testArray),
);
