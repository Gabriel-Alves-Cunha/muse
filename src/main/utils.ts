import type { Base64 } from "@common/@types/generalTypes";

import { homedir } from "node:os";
import { join } from "node:path";

import { isDev } from "@common/utils";

/////////////////////////////////////////

// I'm doing this with trial and error and console, unfortunally:
const rootDirectory = join(__dirname, "..", "..", "..");

// This path has to be like this cause of the transpiling of
// Typescript -> Javascript output dir is different for 'main'
// compared to 'electron' (confirm with the log):
export const logoPath = isDev ?
	join(rootDirectory, "src", "renderer", "assets", "icons", "logo.png") :
	join(rootDirectory, "muse.png");

// console.log({ rootDirectory, logoPath });

/////////////////////////////////////////

const homeDir = homedir();
export const dirs = Object.freeze({
	documents: join(homeDir, "Documents"),
	downloads: join(homeDir, "Downloads"),
	music: join(homeDir, "Music"),
});

/////////////////////////////////////////

export function isBase64Image(str: string): str is Base64 {
	return str.includes("data:image/") && str.includes(";base64,");
}

/////////////////////////////////////////

// TODO: I don't know how to put this api key in .env and get Vite+elecrun to pick it up!!
export const lyricApiKey =
	"1996d0wcfWZB02aebwtkAYhcnERFnAbOGlDiIPWDNdnh3K0955cZpHov";
export const lyricsAPI = "https://api.happi.dev/v1/music";
