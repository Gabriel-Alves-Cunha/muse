import {
	documentDir,
	downloadDir,
	audioDir,
	dirname,
	join,
} from "@tauri-apps/api/path";

import { isDevelopment } from "@common/utils";

const dirName = await dirname(import.meta.url);
const rootDirectory = isDevelopment
	? await join(dirName, "..", "..", "..")
	: dirName;

// This path has to be like this cause of the transpiling of
// Typescript -> Javascript output dir is different for 'main'
// compared to 'electron' (confirm with the log):
export const logoPath = isDevelopment
	? await join(rootDirectory, "src", "renderer", "assets", "icons", "logo.png")
	: await join(rootDirectory, "assets", "logo.png");

console.log({ rootDirectory, logoPath, dirName });

export const dirs = Object.freeze({
	documents: await documentDir(),
	downloads: await downloadDir(),
	music: await audioDir(),
});

export const get = (array: readonly string[], url_: Readonly<string>) =>
	array.find(url => url === url_);

export const remove = (array: string[], url_: Readonly<string>) => {
	const index = array.findIndex(url => url === url_);
	if (index !== -1) array.splice(index, 1);
};
