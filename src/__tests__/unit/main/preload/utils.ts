import type { ImgString } from "@common/@types/electron-window";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { dbgTests } from "@common/utils";

export const test_assets = resolve(__dirname, "..", "..", "..", "test_assets");

export const mediaPath = resolve(test_assets, "audio for tests.mp3");

// A duplicate of the media above for testing purposes (if only one media,
// the threads compete for the entity and an ENOENT error is raised)!
export const anotherMediaPath = resolve(
	test_assets,
	"another audio for tests.mp3",
);

export const mediaPicture = resolve(test_assets, "img for tests.png");

dbgTests("utils.ts", {
	mediaPath,
	mediaPicture,
	__dirname,
	import: import.meta,
});

export async function getThumbnail() {
	const base64 = await readFile(mediaPicture, { encoding: "base64" });

	const img: ImgString = `data:image/png;base64,${base64}`;

	return img;
}
