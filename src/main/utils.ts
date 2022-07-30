import { homedir } from "node:os";
import { join } from "node:path";

import { isDevelopment } from "@common/utils";

/////////////////////////////////////////

// I'm doing this with trial and error and console, unfortunally:
const rootDirectory = join(__dirname, "..", "..", "..");

// This path has to be like this cause of the transpiling of
// Typescript -> Javascript output dir is different for 'main'
// compared to 'electron' (confirm with the log):
export const logoPath = isDevelopment ?
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

export const lyricApiKey =
	"1996d0wcfWZB02aebwtkAYhcnERFnAbOGlDiIPWDNdnh3K0955cZpHov";
export const lyricsAPI = "https://api.happi.dev/v1/music";
