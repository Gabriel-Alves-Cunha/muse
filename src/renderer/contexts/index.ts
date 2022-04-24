export { usePage } from "./page";

export {
	CurrentPlayingEnum,
	useCurrentPlaying,
	getCurrentPlaying,
	setCurrentPlaying,
} from "./mediaHandler/useCurrentPlaying";
export type {
	currentPlayingReducer_Action,
	CurrentPlaying,
} from "./mediaHandler/useCurrentPlaying";

export {
	PlayOptionsType,
	usePlayOptions,
	setPlayOptions,
	getPlayOptions,
} from "./mediaHandler/usePlayOptions";
export type {
	PlayOptionsAction,
	PlayOptions,
} from "./mediaHandler/usePlayOptions";

export {
	searchLocalComputerForMedias,
	searchForMediaFromList,
	PlaylistActions,
	createPlaylist,
	PlaylistEnum,
	usePlaylists,
	setPlaylists,
	getPlaylists,
	deleteMedia,
} from "./mediaHandler/usePlaylists";
export type {
	PlaylistsReducer_Action,
	DefaultLists,
	Playlist,
} from "./mediaHandler/usePlaylists";

export {
	returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia,
	maxSizeOfHistory,
	SORTED_BY_DATE,
	SORTED_BY_NAME,
	getMediaFiles,
	FAVORITES,
	MAIN_LIST,
	HISTORY,
} from "./mediaHandler/usePlaylistsHelper";
