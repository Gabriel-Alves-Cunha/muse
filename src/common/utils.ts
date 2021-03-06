import { debug } from "debug";

const { trunc, floor, random } = Math;
const { isNaN } = Number;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

// @ts-ignore => `NODE_ENV` has to be accessed by dot notation:
export const isDevelopment = process.env.NODE_ENV === "development";

export const capitalizedAppName = "Muse";
export const lowercaseAppName = "muse";

export const dbgPlaylists = debug(`${lowercaseAppName}:playlists`);
export const dbgTests = debug(`${lowercaseAppName}:tests`);
export const dbg = debug(lowercaseAppName);

dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");

/////////////////////////////////////////

export const separatedByCommaOrSemiColorOrSpace = /,|;| /gm;
export const separatedByCommaOrSemiColon = /,|;/gm;

/////////////////////////////////////////

export const allowedMedias = Object.freeze(
	[
		"vorbis",
		"webm",
		"flac",
		"opus",
		"mp3",
		"pcm",
		"aac",
		"m4a",
		"m4p",
		"m4b",
		"m4r",
		"m4v",
	] as const,
);
export type AllowedMedias = Readonly<typeof allowedMedias[number]>;

/////////////////////////////////////////

export function formatDuration(time: number | undefined): Readonly<string> {
	if (!time || isNaN(time)) return "00:00";
	time = trunc(time);

	const hour = ("0" + (floor(time / 3_600) % 24)).slice(-2),
		minutes = ("0" + (floor(time / 60) % 60)).slice(-2),
		seconds = ("0" + (time % 60)).slice(-2),
		days = floor(time / 86_400);

	return ((days > 0 ? days + "d " : "") +
		(Number(hour) > 0 ? hour + ":" : "") +
		(minutes + ":" + seconds));
}

/////////////////////////////////////////

export function makeRandomString(length = 15): Readonly<string> {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	const result = [];
	for (let i = 0; i < length; ++i)
		result.push(chars.charAt(floor(random() * chars.length)));

	return result.join("");
}

/////////////////////////////////////////

export function sleep(ms: number, logFn?: () => void): Promise<void> {
	logFn?.();

	return new Promise(resolve => setTimeout(resolve, ms));
}

/////////////////////////////////////////

export const stringifyJson = (obj: unknown) => JSON.stringify(obj, null, 2);

/////////////////////////////////////////

export const eraseImg = "erase img";
