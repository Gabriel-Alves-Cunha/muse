import { folders } from "@renderer/utils/app";

export type Page = Readonly<typeof folders[number]>;
export type PrettyBytes = Readonly<string>;
export type Path = Readonly<string>;

type DateAsNumber = Readonly<number>;

export type Media = Readonly<{
	genres?: readonly string[];
	dateOfArival: DateAsNumber;
	size: PrettyBytes;
	duration: string;
	artist?: string;
	album?: string;
	title: string;
	index: number;
	img?: string;
	path: Path;
}>;
