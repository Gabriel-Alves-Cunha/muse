import type { Base64 } from "@common/@types/generalTypes";

import { resolve } from "node:path";
import { homedir } from "node:os";

// This path has to be like this because of the bundling
// process. This way it handles both cases: dev and prod.
// @ts-ignore => isDev is a globally defined boolean.
export const logoPath = isDev ?
	resolve("src", "renderer", "assets", "icons", "logo.png") :
	resolve("muse.png");

/////////////////////////////////////////

const homeDir = homedir();
export const dirs = {
	documents: resolve(homeDir, "Documents"),
	downloads: resolve(homeDir, "Downloads"),
	music: resolve(homeDir, "Music"),
};

/////////////////////////////////////////

export const isBase64Image = (str: string): str is Base64 =>
	str.includes("data:image/") && str.includes(";base64,");

/////////////////////////////////////////

console.log("VITE_LYRIC_API_KEY =", process.env.VITE_LYRIC_API_KEY);

// TODO: I don't know how to put this api key in .env and get Vite+elecrun to pick it up!!
export const lyricApiKey =
	"1996d0wcfWZB02aebwtkAYhcnERFnAbOGlDiIPWDNdnh3K0955cZpHov";
export const lyricsAPI = "https://api.happi.dev/v1/music";
