import type { Json } from "./@types/Utils";

const { trunc, floor, random } = Math;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const capitalizedAppName = "Muse";

/////////////////////////////////////////

export const SEPARATED_BY_COMMA_OR_SEMI_COLON_OR_SPACE_REGEX = /,|;| /gm;

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

export function formatDuration(timeOrUndefined: number | undefined): string {
	// @ts-ignore => isFinite(undefined) === false
	if (!isFinite(timeOrUndefined)) return "00:00";
	// @ts-ignore => Here, `time` is defined.
	const time = trunc(timeOrUndefined);

	const hour = `0${floor(time / 3_600) % 24}`.slice(-2);
	const minutes = `0${floor(time / 60) % 60}`.slice(-2);
	const seconds = `0${time % 60}`.slice(-2);
	const daysNumber = floor(time / 86_400);
	const days = daysNumber > 0 ? `${daysNumber}d ` : "";
	const hours = +hour > 0 ? `${hour}:` : "";

	return `${days}${hours}${minutes}:${seconds}`;
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

export const stringifyJson = (obj: Json): string =>
	JSON.stringify(obj, null, 2);

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
