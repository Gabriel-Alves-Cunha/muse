import type { AllowedMedias } from "../utils";

import { pages } from "@utils/app";

export type Page = Readonly<typeof pages[number]>;
export type DateAsNumber = Readonly<number>;
export type Path = Readonly<string>;

export type Media = Readonly<
	{
		artist: string | undefined;
		album: string | undefined;
		genres: readonly string[];
		birthTime: DateAsNumber;
		isSelected: boolean;
		duration: string;
		title: string;
		size: number;
		img: string;
	}
>;

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

export type DownloadInfo = Readonly<
	{ extension: AllowedMedias; imageURL: string; title: string; url: string; }
>;

export type QRCodeURL = `http://${string}:${number}`;

export type TypeOfMapValue<T> = T extends Map<unknown, infer V> ? V : never;

export type TypeOfMap<T> = T extends ReadonlyMap<infer K, infer V> ? [K, V][]
	: never;

export type ImgString = Readonly<`data:${string};base64,${string}`>;

export type Values<Obj> = Obj[keyof Obj];

export type OneOf<T> = keyof T;
