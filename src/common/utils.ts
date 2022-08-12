import { debug } from "debug";

const { trunc, floor, random } = Math;
const { isNaN } = Number;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

// @ts-ignore => `NODE_ENV` has to be accessed by dot notation:
export const isDev = process.env.NODE_ENV === "development";

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
	if (time === undefined || isNaN(time) || !isFinite(time)) return "00:00";
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

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function makeRandomString(length = 15): Readonly<string> {
	const randomString = Array
		.from({ length }, () =>
			chars.charAt(floor(random() * chars.length)))
		.join("");

	return randomString;
}

/////////////////////////////////////////

export function sleep(ms: number, logFn?: () => void): Promise<void> {
	logFn?.();

	return new Promise(resolve => setTimeout(resolve, ms));
}

/////////////////////////////////////////

export const stringifyJson = (obj: unknown) => JSON.stringify(obj, null, 2);

/////////////////////////////////////////

/** Map a number from range X to range Y. */
export const mapTo = (
	val: Readonly<number>,
	from: readonly [start: number, end: number],
	to: readonly [start: number, end: number],
): Readonly<number> =>
	((val - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0];

/////////////////////////////////////////

export const eraseImg = "erase img";
