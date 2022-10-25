const { trunc, floor, random } = Math;
const { isNaN } = Number;

/////////////////////////////////////////
/////////////////////////////////////////
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

export function formatDuration(time?: number): Readonly<string> {
	if (time === undefined || isNaN(time) || !isFinite(time)) return "00:00";
	time = trunc(time);

	const hour = ("0" + (floor(time / 3_600) % 24)).slice(-2),
		minutes = ("0" + (floor(time / 60) % 60)).slice(-2),
		seconds = ("0" + (time % 60)).slice(-2),
		days = floor(time / 86_400);

	return ((days > 0 ? days + "d " : "") +
		(+hour > 0 ? hour + ":" : "") + // +hour === Number(hour)
		(minutes + ":" + seconds));
}

/////////////////////////////////////////

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function makeRandomString(length = 15): Readonly<string> {
	const randomString = Array
		.from({ length }, () => chars.charAt(floor(random() * chars.length)))
		.join("");

	return randomString;
}

/////////////////////////////////////////

export function sleep(ms: number, logFn?: () => void): Promise<void> {
	logFn?.();

	return new Promise(resolve => setTimeout(resolve, ms));
}

/////////////////////////////////////////

export function stringifyJson(obj: unknown) {
	return JSON.stringify(obj, null, 2);
}

/////////////////////////////////////////

/** Map a number from range X to range Y. */
export const mapTo = (
	value: Readonly<number>,
	from: readonly [start: number, end: number],
	to: readonly [start: number, end: number],
): Readonly<number> =>
	((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0];

/////////////////////////////////////////

export function randomBackgroundColorForConsole(): () => string {
	let index = 0;

	// dprint-ignore
	const colors: Color[] = [
		["#fff", "#3490db"],
		["#fff", "#1abc9c"],
		["#fff", "#2a47ec"],
	];

	return () => {
		if (index >= colors.length) index = 0;

		const color = `color: ${colors[index]
			?.[0]}; background-color: ${colors[index]
			?.[1]}; border-radius: 2px; padding: 2px 4px; font-weight: bold;`;

		++index;

		return color;
	};
}

type Color = readonly [color: string, backgroundColor: string];

/////////////////////////////////////////

export const eraseImg = "erase img";
