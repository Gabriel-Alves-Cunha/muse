import type { ImgString } from "@common/@types/electron-window";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { dbgTests } from "@common/utils";

const originalTitle = "audio for tests" as const;

export const test_assets = resolve(__dirname, "..", "..", "..", "test_assets");

export const mediaPath = resolve(test_assets, `${originalTitle}.mp3`);

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
