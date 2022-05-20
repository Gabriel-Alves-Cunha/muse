import type { MainList } from "@contexts/mediaHandler/usePlaylists";

import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";

// Make a test list full of fake medias:
export const numberOfMedias = 30;
export const testArray = Array.from({ length: numberOfMedias }, (_, index) => {
	const title = faker.unique(faker.name.jobTitle);

	return [
		`home/Music/test/${title}.mp3`,
		{
			dateOfArival: faker.date.past().getTime(),
			duration: formatDuration(index + 10),
			size: "3.0 MB",
			title,
		},
	] as const;
});
export const testList: MainList = new Map(testArray);
