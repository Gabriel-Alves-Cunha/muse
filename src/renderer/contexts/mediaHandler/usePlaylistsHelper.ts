import type { Path } from "@common/@types/generalTypes";

import { allowedMedias, getLastExtension } from "@common/utils";
import { MainList } from "./usePlaylists";

const {
	fs: { readdir, getFullPathOfFilesForFilesInThisDirectory },
	os: { dirs },
} = electron;

export function getMediaFiles(fileList: Readonly<FileList>): readonly File[] {
	const supportedFiles: File[] = [];

	for (const file of fileList) {
		// Faster than regex:
		if (!file.type.includes("audio") && !file.type.includes("video")) continue;

		console.log(file);

		supportedFiles.push(file);
	}

	return supportedFiles;
}

export async function searchDirectoryResult() {
	const start = performance.now();

	const fullPaths = (
		await Promise.allSettled([
			getFullPathOfFilesForFilesInThisDirectory(dirs.documents),
			getFullPathOfFilesForFilesInThisDirectory(dirs.downloads),
			getFullPathOfFilesForFilesInThisDirectory(dirs.music),
		])
	)
		.map(p => (p.status === "fulfilled" ? p.value : undefined))
		.filter(Boolean)
		.flat() as readonly string[];

	const end = performance.now();
	console.log(
		`%csearchDirectoryResult took: ${end - start} ms.`,
		"color:brown"
	);

	return fullPaths;
}

export const searchDirectoryForMedias = async (directory: string) =>
	getAllowedMedias(await readdir(directory));

export const getAllowedMedias = (
	filenames: readonly string[]
): readonly string[] =>
	filenames.filter(name =>
		allowedMedias.some(ext => ext === getLastExtension(name))
	);

export const sortByDate = (list: MainList): Set<Path> => {
	const listAsArray: { dateOfArival: number; path: Path }[] = [];

	list.forEach(({ dateOfArival }, path) =>
		listAsArray.push({ dateOfArival, path })
	);

	listAsArray.sort((a, b) => {
		if (a.dateOfArival > b.dateOfArival) return 1;
		if (a.dateOfArival < b.dateOfArival) return -1;
		// a must be equal to b:
		return 0;
	});

	return new Set(listAsArray.map(media => media.path));
};

export const sortByName = (list: MainList) => {
	const listAsArray: { title: string; path: Path }[] = [];

	list.forEach(({ title }, path) => listAsArray.push({ title, path }));

	listAsArray.sort((a, b) => {
		if (a.title > b.title) return 1;
		if (a.title < b.title) return -1;
		// a must be equal to b:
		return 0;
	});

	return new Set(listAsArray.map(media => media.path));
};
