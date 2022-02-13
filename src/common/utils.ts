import type { Draft } from "immer";
import type {
	StateCreator,
	GetState,
	StoreApi,
	SetState,
	State,
} from "zustand";

import { debug, enable } from "debug";
import produce from "immer";

const { trunc, floor } = Math;

export const isDevelopment = process.env.NODE_ENV === "development";
console.log("Electron isDevelopment =", isDevelopment);

export const capitalizedAppName = "Muse" as const;
export const lowercaseAppName = "muse" as const;

export const dbg = debug(lowercaseAppName);

if (isDevelopment) enable(lowercaseAppName);
dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");

export const allowedMedias = [
	"vorbis",
	"webm",
	"flac",
	"opus",
	"mp3",
	"pcm",
	"pcm",
	"aac",
	"m4a",
	"m4p",
	"m4b",
	"m4r",
	"m4v",
] as const;
export type AllowedMedias = Readonly<typeof allowedMedias[number]>;

export const getBasename = (filename: string) =>
	filename.split("\\").pop()?.split("/").pop()?.split(".")[0] ?? "";

export const getPathWithoutExtension = (filename: string) => {
	const lastIndex =
		filename.indexOf(".") === -1 ? filename.length : filename.indexOf(".");

	return filename.slice(0, lastIndex);
};

export const formatDuration = (time: number | undefined) => {
	if (time === undefined) return "";
	time = trunc(time);

	const days = floor(time / 86_400),
		hour = ("0" + (floor(time / 3_600) % 24)).slice(-2),
		minutes = ("0" + (floor(time / 60) % 60)).slice(-2),
		seconds = ("0" + (time % 60)).slice(-2);

	return (
		(days > 0 ? days + "d " : "") +
		(Number(hour) > 0 ? hour + ":" : "") +
		(minutes + ":" + seconds)
	);
};

export const immer =
	<
		T extends State,
		CustomSetState extends SetState<T>,
		CustomGetState extends GetState<T>,
		CustomStoreApi extends StoreApi<T>,
	>(
		config: StateCreator<
			T,
			(partial: ((draft: Draft<T>) => void) | T, replace?: boolean) => void,
			CustomGetState,
			CustomStoreApi
		>,
	): StateCreator<T, CustomSetState, CustomGetState, CustomStoreApi> =>
	(set, get, api) =>
		config(
			(partial, replace) => {
				const nextState =
					typeof partial === "function"
						? produce(partial as (state: Draft<T>) => T)
						: (partial as T);
				return set(nextState, replace);
			},
			get,
			api,
		);
