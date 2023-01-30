export const ProgressStatus = {
	WAITING_FOR_CONFIRMATION_FROM_ELECTRON: 2,
	SUCCESS: 3,
	ACTIVE: 4,
	CANCEL: 5,
	FAILED: 6,
} as const;

/////////////////////////////////////////////

export const MessageToBackend = {
	TOGGLE_DEVELOPER_TOOLS: "2",
	CREATE_A_NEW_DOWNLOAD: "3",
	TOGGLE_MAXIMIZE: "4",
	RELOAD_WINDOW: "5",
	CONVERT_MEDIA: "6",
	WRITE_TAG: "7",
	MINIMIZE: "8",
	QUIT_APP: "9",
	ERROR: "10",
} as const;

/////////////////////////////////////////////

export const MessageToFrontend = {
	DELETE_ONE_MEDIA_FROM_COMPUTER: "DELETE_ONE_MEDIA_FROM_COMPUTER",
	CLIPBOARD_TEXT_CHANGED: "CLIPBOARD_TEXT_CHANGED",
	CREATE_A_NEW_DOWNLOAD: "CREATE_A_NEW_DOWNLOAD",
	RESCAN_ALL_MEDIA: "REFRESH_ALL_MEDIA",
	RESCAN_ONE_MEDIA: "REFRESH_ONE_MEDIA",
	REMOVE_ONE_MEDIA: "REMOVE_ONE_MEDIA",
	ADD_ONE_MEDIA: "ADD_ONE_MEDIA",
	ERROR: "ERROR",
} as const;

/////////////////////////////////////////////

export const playlistList = {
	mainList: "sortedByTitleAndMainList",
	sortedByDate: "sortedByDate",
	favorites: "favorites",
	history: "history",
} as const;
