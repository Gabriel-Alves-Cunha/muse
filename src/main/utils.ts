import type { Base64 } from "@common/@types/GeneralTypes";

import { userInfo } from "node:os";
import { join } from "node:path";

/////////////////////////////////////////

const { homedir } = userInfo();

console.log({ homedir });

export const dirs = {
	documents: join(homedir, "Documents"),
	downloads: join(homedir, "Downloads"),
	music: join(homedir, "Music"),
} as const;

/////////////////////////////////////////

export const isBase64Image = (str: string): str is Base64 =>
	str.includes("data:image/") && str.includes(";base64,");

/////////////////////////////////////////

export const lyricApiKey = process.env.LYRIC_API_KEY;
export const lyricsAPI = process.env.LYRIC_API;
