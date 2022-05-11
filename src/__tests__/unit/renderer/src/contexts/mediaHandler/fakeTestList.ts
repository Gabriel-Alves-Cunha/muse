import type { Media } from "@common/@types/typesAndEnums";

import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";
import { hash } from "@common/hash";

// Make a test list full of fake medias:
export const numberOfMedias = 30;
export const testList: readonly Media[] = Object.freeze(
	Array.from({ length: numberOfMedias }, (_, index) => {
		const title = faker.unique(faker.name.jobTitle);

		return {
			dateOfArival: faker.date.past().getTime(),
			duration: formatDuration(index + 10),
			path: `home/Music/test/${title}.mp3`,
			favorite: false,
			selected: false,
			id: hash(title),
			size: "3.0 MB",
			title,
		};
	}),
);
