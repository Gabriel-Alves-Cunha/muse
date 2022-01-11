import type { Readable } from "stream";

import { homedir } from "os";
import { join } from "path";

import { isDevelopment } from "@common/utils";

// This path has to be like this cause of the transpiling of
// Typescript -> Javascript output dir is different for 'main'
// compared to 'electron' (confirm with the log):
export const logoPath = isDevelopment
	? join(
			__dirname,
			"..",
			"..",
			"..",
			"src",
			"renderer",
			"assets",
			"icons",
			"logo.png",
	  )
	: join(__dirname, "..", "src", "renderer", "assets", "icons", "logo.png");
console.log(`logoPath = "${logoPath}"`);

export const homeDir = homedir();
export const dirs = Object.freeze({
	documents: join(homeDir, "Documents"),
	downloads: join(homeDir, "Downloads"),
	music: join(homeDir, "Music"),
});

export type Stream = Readonly<{ url: string; stream: Readable }>;

export const has = (
	array: readonly Stream[],
	url_: Readonly<string>,
): boolean =>
	array.findIndex(({ url }) => url === url_) === -1 ? false : true;

export const get = (array: readonly Stream[], url_: Readonly<string>) =>
	array.find(({ url }) => url === url_);

export const remove = (array: Stream[], url_: Readonly<string>) =>
	(array = array.filter(({ url }) => url !== url_));

export const push = (array: Stream[], stream: Stream) => {
	array.push(stream);
	if (array.length > 10) array.length = 10;
};
