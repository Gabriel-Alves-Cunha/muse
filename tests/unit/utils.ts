import type { Base64 } from "types/generalTypes";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// import { dbgTests } from "@common/utils";

export const test_assetsDir = resolve(__dirname, "..", "test_assets");

export const mediaPath = resolve(test_assetsDir, "audio for tests.mp3");

// A duplicate of the media above for testing purposes (if only one media,
// the threads compete for the entity and an ENOENT error is raised)!
export const anotherMediaPath = resolve(
	test_assetsDir,
	"another audio for tests.mp3",
);

export const mediaPicture = resolve(test_assetsDir, "img for tests.png");

export async function getThumbnail() {
	const base64 = await readFile(mediaPicture, { encoding: "base64" });

	const img: Base64 = `data:image/png;base64,${base64}`;

	return img;
}
