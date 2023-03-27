import type { AllowedMedias, eraseImg } from "../utils";
import type { pages } from "@utils/app";

export type Media = Readonly<{
	lastModified: DateAsNumber;
	genres: readonly string[];
	birthTime: DateAsNumber;
	image: Base64 | "";
	duration: string;
	lyrics: string;
	artist: string;
	album: string;
	title: string;
	size: number;
}>;

export type DownloadInfo = Readonly<{
	extension: AllowedMedias;
	imageURL: string;
	artist: string;
	title: string;
	url: string;
}>;

export type ImageURL = typeof eraseImg | Base64 | (string & {});

export type Base64 = `data:${string};base64,${string}`;

export type QRCodeURL = `http://${string}:${number}`;

export type Page = typeof pages[number];

export type Path = string;
