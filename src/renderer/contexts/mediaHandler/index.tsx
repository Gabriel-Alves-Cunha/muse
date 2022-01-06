import type { Playlist, PlaylistsReducer_Action } from "./usePlaylists";
import type { PlayOptions, PlayOptions_Action } from "./usePlayOptions";
import type { ReactNode, Dispatch } from "react";
import type { Media } from "@common/@types/types";
import type {
	currentPlayingReducer_Action,
	CurrentPlaying,
} from "./useCurrentPlaying";

import { createContext, useContext } from "react";

import { useCurrentPlaying } from "./useCurrentPlaying";
import { usePlayOptions } from "./usePlayOptions";
import { usePlaylists } from "./usePlaylists";

const MediaList_Context = createContext({} as MediaList_ContextProps);

function MediaHandler_Provider({ children }: { children: ReactNode }) {
	const [playOptions, dispatchPlayOptions] = usePlayOptions();
	const {
		searchLocalComputerForMedias,
		dispatchPlaylists,
		searchForMedia,
		deleteMedia,
		playlists,
	} = usePlaylists();
	const [currentPlaying, dispatchCurrentPlaying] = useCurrentPlaying({
		dispatchPlayOptions,
		dispatchPlaylists,
		playOptions,
		playlists,
	});

	return (
		<MediaList_Context.Provider
			value={{
				functions: {
					searchLocalComputerForMedias,
					dispatchCurrentPlaying,
					dispatchPlayOptions,
					dispatchPlaylists,
					searchForMedia,
					deleteMedia,
				},
				values: {
					currentPlaying,
					playOptions,
					playlists,
				},
			}}
		>
			{children}
		</MediaList_Context.Provider>
	);
}

function useMediaHandler() {
	const context = useContext(MediaList_Context);

	if (!context)
		throw new Error(
			"`useMediaList` must be used within a `<MediaHandler_Context>`",
		);

	return context;
}

export { useMediaHandler, MediaHandler_Provider };

MediaHandler_Provider.whyDidYouRender = {
	customName: "MediaList_Provider",
	logOnDifferentValues: false,
};

type MediaList_ContextProps = Readonly<{
	functions: {
		dispatchCurrentPlaying: Dispatch<currentPlayingReducer_Action>;
		searchForMedia: (searchTerm: string) => readonly Media[];
		dispatchPlaylists: Dispatch<PlaylistsReducer_Action>;
		dispatchPlayOptions: Dispatch<PlayOptions_Action>;
		deleteMedia: (media: Media) => Promise<void>;
		searchLocalComputerForMedias: (
			force?: boolean | undefined,
		) => Promise<void>;
	};
	values: {
		playlists: readonly Playlist[];
		currentPlaying: CurrentPlaying;
		playOptions: PlayOptions;
	};
}>;
