import type { ReactNode } from "react";
import type { Media } from "@common/@types/types";

export type MediaList_ContextProps = Readonly<{
	playlists: readonly Playlist[];
	dispatches: {
		dispatchCurrentPlaying: React.Dispatch<currentPlayingReducer_Action>;
		dispatchPlaylists: React.Dispatch<PlaylistsReducer_Action>;
		dispatchPlayOptions: React.Dispatch<PlayOptions_Action>;
	};
	values: {
		currentPlaying: CurrentPlaying;
		playOptions: PlayOptions;
	};
	functions: {
		searchLocalComputerForMedias(force?: boolean): Promise<void>;
		searchForMedia(searchTerm: string): readonly Media[];
		deleteMedia(media: Media): Promise<void>;
	};
}>;

export type MediaList_ProviderProps = { children: ReactNode };

export type CurrentPlaying = Readonly<{
	playlist: Playlist;
	seconds?: number;
	media?: Media;
}>;

export type PlayOptions = Readonly<{
	repeatAllMedia: boolean;
	loopThisMedia: boolean;
	isRandom: boolean;
	isPaused: boolean;
	muted: boolean;
}>;

export type Playlist = Readonly<{
	list: readonly Media[];
	name: string;
}>;

export type PlayOptions_Action =
	| Readonly<{ type: "repeat all media"; value: PlayOptions["repeatAllMedia"] }>
	| Readonly<{ type: "loop this media"; value: PlayOptions["loopThisMedia"] }>
	| Readonly<{ type: "is random"; value: PlayOptions["isRandom"] }>
	| Readonly<{ type: "is paused"; value: PlayOptions["isPaused"] }>
	| Readonly<{ type: "muted"; value: PlayOptions["muted"] }>;

export type currentPlayingReducer_Action =
	| Readonly<{ type: "play this media"; media: Media; playlist: Playlist }>
	| Readonly<{ type: "new"; media: Media; playlist: Playlist }>
	| Readonly<{ type: "play previous"; playlist: Playlist }>
	| Readonly<{ type: "play next"; playlist: Playlist }>
	| Readonly<{ type: "resume"; atSecond: number }>
	| Readonly<{ type: "pause"; atSecond: number }>
	| Readonly<{ type: "there is no media" }>;

export type PlaylistsReducer_Action =
	| Readonly<{
			type: "create or update playlists";
			list: readonly Media[];
			name: string;
	  }>
	| Readonly<{
			whatToDo: "add" | "remove" | "clean";
			type: "update favorites";
			media: Media;
	  }>
	| Readonly<{
			whatToDo: "add" | "remove" | "new list" | "refresh one" | "clean";
			type: "update mediaList";
			list?: readonly Media[];
			media?: Media;
	  }>
	| Readonly<{
			whatToDo: "add" | "clean";
			type: "update history";
			media?: Media;
	  }>
	| Readonly<{ type: "update sorted by date"; list: readonly Media[] }>
	| Readonly<{ type: "update sorted by name"; list: readonly Media[] }>;

export type historyOfPlayedMediaReducer_Action = Readonly<{
	newList: readonly Media[];
	type: "new";
}>;
