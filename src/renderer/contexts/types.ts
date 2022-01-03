import type { CurrentPlaying } from "@renderer/hooks/useCurrentPlaying";
import type { ReactNode } from "react";
import type { Media } from "@common/@types/types";

export type MediaList_ContextProps = Readonly<{
	values: {
		currentPlaying: CurrentPlaying;
	};
	functions: {
		searchLocalComputerForMedias(force?: boolean): Promise<void>;
		searchForMedia(searchTerm: string): readonly Media[];
		deleteMedia(media: Media): Promise<void>;
	};
}>;

export type MediaList_ProviderProps = { children: ReactNode };

export type historyOfPlayedMediaReducer_Action = Readonly<{
	newList: readonly Media[];
	type: "new";
}>;
