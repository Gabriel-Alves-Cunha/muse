// import type { Playlist, PlaylistsReducer_Action } from "./usePlaylists";
// import type { PlayOptions, PlayOptions_Action } from "./usePlayOptions";
// import type { ReactNode } from "react";
// import type { Media } from "@common/@types/typesAndEnums";
// import type {
// 	currentPlayingReducer_Action,
// 	CurrentPlaying,
// } from "./useCurrentPlaying";

// import { createContext, useContext } from "react";

// import { useCurrentPlaying } from "./useCurrentPlaying";
// import { usePlayOptions } from "./usePlayOptions";
// import { usePlaylists } from "./usePlaylists";

// const MediaList_Context = createContext({} as MediaList_ContextProps);

// function MediaHandler_Provider({ children }: { children: ReactNode }) {
// 	const { currentPlaying, setCurrentPlaying } = useCurrentPlaying();
// 	const { playOptions, setPlayOptions } = usePlayOptions();
// 	const {
// 		searchLocalComputerForMedias,
// 		searchForMedia,
// 		setPlaylists,
// 		deleteMedia,
// 		playlists,
// 	} = usePlaylists();

// 	return (
// 		<MediaList_Context.Provider
// 			value={{
// 				functions: {
// 					searchLocalComputerForMedias,
// 					setCurrentPlaying,
// 					searchForMedia,
// 					setPlayOptions,
// 					setPlaylists,
// 					deleteMedia,
// 				},
// 				values: {
// 					currentPlaying,
// 					playOptions,
// 					playlists,
// 				},
// 			}}
// 		>
// 			{children}
// 		</MediaList_Context.Provider>
// 	);
// }

// const useMediaHandler = () => {
// 	const context = useContext(MediaList_Context);

// 	if (!context)
// 		throw new Error(
// 			"`useMediaList` must be used within a `<MediaHandler_Context>`",
// 		);

// 	return context;
// };

// export { useMediaHandler, MediaHandler_Provider };

// MediaHandler_Provider.whyDidYouRender = {
// 	customName: "MediaList_Provider",
// 	logOnDifferentValues: false,
// };

// type MediaList_ContextProps = Readonly<{
// 	functions: {
// 		setCurrentPlaying: (action: currentPlayingReducer_Action) => void;
// 		searchLocalComputerForMedias(force?: boolean): Promise<void>;
// 		setPlaylists: (action: PlaylistsReducer_Action) => void;
// 		searchForMedia(searchTerm: string): readonly Media[];
// 		setPlayOptions(action: PlayOptions_Action): void;
// 		deleteMedia(media: Media): Promise<void>;
// 	};
// 	values: {
// 		playlists: readonly Playlist[];
// 		currentPlaying: CurrentPlaying;
// 		playOptions: PlayOptions;
// 	};
// }>;
export {};
