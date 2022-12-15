import type { Base64 } from "@common/@types/generalTypes";

import { resolve } from "node:path";
import { homedir } from "node:os";

// This path has to be like this because of the bundling
// process. This way it handles both cases: dev and prod.
export const logoPath = isDev
	? resolve("src", "renderer", "assets", "logo.png")
	: resolve("muse.png");

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

export const lyricApiKey = process.env.LYRIC_API_KEY;
export const lyricsAPI = process.env.LYRIC_API;
