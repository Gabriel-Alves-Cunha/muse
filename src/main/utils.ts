import type { Base64 } from "@common/@types/generalTypes";

import { homedir } from "node:os";
import { join } from "node:path";

/////////////////////////////////////////

const homeDir = homedir();
export const dirs = {
	documents: join(homeDir, "Documents"),
	downloads: join(homeDir, "Downloads"),
	music: join(homeDir, "Music"),
};

/////////////////////////////////////////

export const isBase64Image = (str: string): str is Base64 =>
	str.includes("data:image/") && str.includes(";base64,");

/////////////////////////////////////////

export const lyricApiKey = process.env.LYRIC_API_KEY;
export const lyricsAPI = process.env.LYRIC_API;
