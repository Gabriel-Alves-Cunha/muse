import type { AllowedMedias, eraseImg } from "../utils";

import { pages } from "@utils/app";

export type Page = Readonly<typeof pages[number]>;
export type DateAsNumber = Readonly<number>;
export type Path = Readonly<string>;

export type Media = Readonly<
	{
		genres: readonly string[];
		birthTime: DateAsNumber;
		isSelected: boolean;
		duration: string;
		lyrics: string;
		artist: string;
		album: string;
		title: string;
		image: string;
		size: number;
	}
>;

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

export type DownloadInfo = Readonly<
	{
		extension: AllowedMedias;
		imageURL: string;
		artist: string;
		title: string;
		url: string;
	}
>;

export type QRCodeURL = `http://${string}:${number}`;

export type TypeOfMapValue<T> = T extends Map<unknown, infer V> ? V : never;

export type TypeOfMap<T> = T extends ReadonlyMap<infer K, infer V> ? [K, V][]
	: never;

export type ImgString = Readonly<`data:${string};base64,${string}`>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ImageURL = typeof eraseImg | ImgString | (string & {});

export type Values<Obj> = Obj[keyof Obj];

export type OneOf<T> = keyof T;
