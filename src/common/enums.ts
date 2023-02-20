export const ProgressStatus = {
	WAITING_FOR_CONFIRMATION_FROM_ELECTRON: 2,
	SUCCESS: 3,
	ACTIVE: 4,
	CANCEL: 5,
	FAILED: 6,
} as const;

/////////////////////////////////////////////

export const ReactToElectronMessage = {
	CREATE_A_NEW_DOWNLOAD: 2,
	CONVERT_MEDIA: 3,
	WRITE_TAG: 4,
	ERROR: 5,
} as const;

/////////////////////////////////////////////

export const ElectronToReactMessage = {
	DELETE_ONE_MEDIA_FROM_COMPUTER: "DELETE_ONE_MEDIA_FROM_COMPUTER",
	CREATE_A_NEW_DOWNLOAD: "CREATE_A_NEW_DOWNLOAD",
	RESCAN_ALL_MEDIA: "REFRESH_ALL_MEDIA",
	RESCAN_ONE_MEDIA: "REFRESH_ONE_MEDIA",
	REMOVE_ONE_MEDIA: "REMOVE_ONE_MEDIA",
	ADD_ONE_MEDIA: "ADD_ONE_MEDIA",
	ERROR: "ERROR",
} as const;

/////////////////////////////////////////////

export const ElectronPreloadToMainElectronMessage = {
	CLIPBOARD_TEXT_CHANGED: "CLIPBOARD_TEXT_CHANGED",
} as const;

/////////////////////////////////////////////

export const ElectronIpcMainProcessNotification = {
	TOGGLE_DEVELOPER_TOOLS: 2,
	TOGGLE_MAXIMIZE: 3,
	MINIMIZE: 5,
	QUIT_APP: 6,
} as const;

/////////////////////////////////////////////

export const PlaylistListEnum = {
	mainList: "sortedByTitleAndMainList",
	sortedByDate: "sortedByDate",
	favorites: "favorites",
	history: "history",
} as const;
