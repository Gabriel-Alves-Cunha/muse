import type { Base64 } from "@common/@types/generalTypes";

import { homedir } from "node:os";
import { resolve } from "node:path";

import { isDev } from "@common/utils";

// This path has to be like this cause of the transpiling of
// Typescript -> Javascript output dir is different for 'main'
// compared to 'electron' (confirm with the log):
export const logoPath = isDev ?
	resolve("src", "renderer", "assets", "icons", "logo.png") :
	resolve("muse.png");

/////////////////////////////////////////

const homeDir = homedir();
export const dirs = Object.freeze({
	documents: resolve(homeDir, "Documents"),
	downloads: resolve(homeDir, "Downloads"),
	music: resolve(homeDir, "Music"),
});

/////////////////////////////////////////

export const isBase64Image = (str: string): str is Base64 =>
	str.includes("data:image/") && str.includes(";base64,");

/////////////////////////////////////////

// TODO: I don't know how to put this api key in .env and get Vite+elecrun to pick it up!!
export const lyricApiKey =
	"1996d0wcfWZB02aebwtkAYhcnERFnAbOGlDiIPWDNdnh3K0955cZpHov";
export const lyricsAPI = "https://api.happi.dev/v1/music";
