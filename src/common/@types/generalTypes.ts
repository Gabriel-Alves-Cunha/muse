import type { AllowedMedias } from "../utils";
import type { PrettyBytes } from "../prettyBytes";

import { pages } from "@utils/app";

export type Page = Readonly<typeof pages[number]>;
export type Path = Readonly<string>;

type DateAsNumber = Readonly<number>;

export type Media = Readonly<
	{
		genres?: readonly string[];
		birthTime: DateAsNumber;
		size: PrettyBytes;
		duration: string;
		artist?: string;
		album?: string;
		title: string;
		img?: string;
	}
>;

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

export type DownloadInfo = Readonly<
	{
		canStartDownload: boolean;
		extension: AllowedMedias;
		imageURL: string;
		title: string;
		url: string;
	}
>;

export type TypeOfMapValue<T> = T extends Map<unknown, infer V> ? V : never;

export type TypeOfMap<T> = T extends Map<infer K, infer V> ? [K, V][] : never;

export type Values<Obj> = Obj[keyof Obj];

export type OneOf<T> = keyof T;
