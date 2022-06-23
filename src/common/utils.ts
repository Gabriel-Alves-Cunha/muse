import { debug } from "debug";

// @ts-ignore This has to be like this
export const isDevelopment = process.env.NODE_ENV === "development";

export const capitalizedAppName = "Muse" as const;
export const lowercaseAppName = "muse" as const;

export const dbg = debug(lowercaseAppName);
export const dbgTests = debug(`${lowercaseAppName}:tests`);
export const dbgPlaylists = debug(`${lowercaseAppName}:playlists`);

dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");

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

const { trunc, floor } = Math;
const { isNaN } = Number;

export function formatDuration(time: number | undefined): Readonly<string> {
	if (!time || isNaN(time)) return "00:00";
	time = trunc(time);

	const days = floor(time / 86_400),
		hour = ("0" + (floor(time / 3_600) % 24)).slice(-2),
		minutes = ("0" + (floor(time / 60) % 60)).slice(-2),
		seconds = ("0" + (time % 60)).slice(-2);

	return ((days > 0 ? days + "d " : "") +
		(Number(hour) > 0 ? hour + ":" : "") +
		(minutes + ":" + seconds));
}

/**
 * These are not a bulletproof fns, but for the purpose of
 * getting the allowedMedias, it is ok, faster than NodeJS's.
 */
export function getBasename(filename: Readonly<string>): Readonly<string> {
	return filename.split("\\").pop()?.split("/").pop()?.split(".")[0] ?? "";
}

export function getPathWithoutExtension(
	filename: Readonly<string>,
): Readonly<string> {
	const lastIndex = filename.indexOf(".") === -1 ?
		filename.length :
		filename.indexOf(".");

	return filename.slice(0, lastIndex);
}

/**
 * This doesn't handle files with only extensions,
 * e.g.: '.gitignore' will result in ''.
 */
export function getLastExtension(filename: Readonly<string>): Readonly<string> {
	return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function getBasenameAndExtension(
	filename: Readonly<string>,
): Readonly<[string, string]> {
	return [getBasename(filename), getLastExtension(filename)] as const;
}

export const separatedByCommaOrSemiColorOrSpace = /,|;| /gm;
export const separatedByCommaOrSemiColon = /,|;/gm;
