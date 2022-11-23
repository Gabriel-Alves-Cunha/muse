export const progressStatus = {
	WAITING_FOR_CONFIRMATION_FROM_ELECTRON: 2,
	SUCCESS: 3,
	ACTIVE: 4,
	CANCEL: 5,
	FAILED: 6,
} as const;

/////////////////////////////////////////////

export const reactToElectronMessage = {
	CREATE_A_NEW_DOWNLOAD: 2,
	CONVERT_MEDIA: 3,
	WRITE_TAG: 4,
	ERROR: 5,
} as const;

/////////////////////////////////////////////

export const electronToReactMessage = {
	DELETE_ONE_MEDIA_FROM_COMPUTER: "2",
	CREATE_A_NEW_DOWNLOAD: "3",
	REFRESH_ALL_MEDIA: "4",
	REFRESH_ONE_MEDIA: "5",
	REMOVE_ONE_MEDIA: "6",
	ADD_ONE_MEDIA: "7",
	ERROR: "8",
} as const;

/////////////////////////////////////////////

export const electronIpcMainProcessNotification = {
	TOGGLE_DEVELOPER_TOOLS: 2,
	TOGGLE_MAXIMIZE: 3,
	RELOAD_WINDOW: 4,
	MINIMIZE: 5,
	QUIT_APP: 6,
} as const;

/////////////////////////////////////////////

export const playlistList = {
	mainList: "sortedByNameAndMainList",
	sortedByDate: "sortedByDate",
	favorites: "favorites",
	history: "history",
} as const;
