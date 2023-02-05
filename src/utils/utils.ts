import type { Base64 } from "types/generalTypes";

import { documentDir, downloadDir, audioDir } from "@tauri-apps/api/path";
import { homedir } from "node:os";

import { throwErr, dbg, error } from "./log";
import { join } from "node:path";

const { trunc, floor, random } = Math;

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

/** [min, max) */
export function getRandomInt(min: number, max: number): number {
	if (!(isFinite(min) && isFinite(max)))
		throwErr(
			`'getRandomInt()' can't handle infinite numbers. Received 'min = ${min}' and 'max = ${max}'.`,
		);

	return floor(min + random() * (max - min));
}

//////////////////////////////////////////

export const capitalize = (str: string): string =>
	`${str.charAt(0).toUpperCase()}${str.slice(1)}`;

//////////////////////////////////////////

export function assertUnreachable(received: never): never {
	const error = stringifyJson(received) ?? received;

	throw throwErr(
		"I shouldn't get here (on 'assertUnreachable')!\nReceived = " + error,
	);
}

//////////////////////////////////////////

export function time<T>(fn: () => T, label: string): T {
	const start = performance.now();

	const fnReturn = fn();

	const ms = performance.now() - start;

	dbg(
		`%cFunction %c"${label}" %ctook: ${ms} ms.`,
		"color: brown",
		"color: blue",
		"color: brown",
	);

	return fnReturn;
}

/////////////////////////////////////////

export const capitalizedAppName = "Muse";

/////////////////////////////////////////

export const separatedByCommaOrSemiColorOrSpace = /,|;| /gm;
// export const separatedByCommaOrSemiColon = /,|;/gm;

/////////////////////////////////////////

export const allowedMedias = [
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
] as const;

export type AllowedMedias = typeof allowedMedias[number];

/////////////////////////////////////////

export function formatDuration(time: number | undefined): string {
	// isFinite(undefined) === false
	if (!isFinite(time!)) return "00:00";
	time = trunc(time!);

	const hour = `0${floor(time / 3_600) % 24}`.slice(-2);
	const minutes = `0${floor(time / 60) % 60}`.slice(-2);
	const seconds = `0${time % 60}`.slice(-2);
	const days = floor(time / 86_400);

	return `${days > 0 ? `${days}d ` : ""}${
		+hour > 0 ? `${hour}:` : ""
	}${minutes}:${seconds}`;
}

/////////////////////////////////////////

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const makeRandomString = (length = 15): string =>
	Array.from({ length }, () =>
		chars.charAt(floor(random() * chars.length)),
	).join("");

/////////////////////////////////////////

export function sleep(ms = 0, logFn?: () => void): Promise<void> {
	logFn?.();

	return new Promise((resolve) => setTimeout(resolve, ms));
}

/////////////////////////////////////////

export const stringifyJson = (obj: unknown) => JSON.stringify(obj, null, 2);

/////////////////////////////////////////

/** Map a number from range X to range Y. */
export const mapTo = (
	value: number,
	from: readonly [start: number, end: number],
	to: readonly [start: number, end: number],
): number =>
	((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0];

/////////////////////////////////////////

export function randomBackgroundColorForConsole(): () => string {
	let index = 0;

	const colors: Color[] = [
		["#fff", "#3490db"],
		["#fff", "#1abc9c"],
		["#fff", "#2a47ec"],
	];

	return () => {
		if (index === colors.length) index = 0;

		const color = `color: ${colors[index]?.[0]}; background-color: ${colors[index]?.[1]}; border-radius: 2px; padding: 2px 4px; font-weight: bold;`;

		++index;

		return color;
	};
}

type Color = readonly [color: string, backgroundColor: string];

/////////////////////////////////////////

export const eraseImg = "eraseImg";

/////////////////////////////////////////

const homeDir = homedir();
export const dirs = {
	documents: await documentDir().catch(() => {
		error("Error: could not get documentDir from tauri.");
		return join(homeDir, "Documents");
	}),
	downloads: await downloadDir().catch(() => {
		error("Error: could not get downloadDir from tauri.");
		return join(homeDir, "Downloads");
	}),
	music: await audioDir().catch(() => {
		error("Error: could not get audioDir from tauri.");
		return join(homeDir, "Music");
	}),
} as const;

/////////////////////////////////////////

export const isBase64Image = (str: string): str is Base64 =>
	str.includes("data:image/") && str.includes(";base64,");

/////////////////////////////////////////

export const lyricApiKey = process.env.LYRIC_API_KEY;
export const lyricsAPI = process.env.LYRIC_API;
