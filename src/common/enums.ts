export const ProgressStatus = {
	WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		"waiting for confirmation from electron",
	SUCCESS: "success",
	ACTIVE: "active",
	CANCEL: "cancel",
	FAILED: "failed",
} as const;

/////////////////////////////////////////////

export const ReactToElectronMessage = {
	CREATE_A_NEW_DOWNLOAD: "create a new download",
	CONVERT_MEDIA: "convert media",
	WRITE_TAG: "write tag",
	ERROR: "error",
} as const;

/////////////////////////////////////////////

export const ElectronToReactMessage = {
	DELETE_ONE_MEDIA_FROM_COMPUTER: "delete one media from computer",
	CREATE_A_NEW_DOWNLOAD: "create a new download",
	REFRESH_ALL_MEDIA: "refresh all media",
	REFRESH_ONE_MEDIA: "refresh one media",
	REMOVE_ONE_MEDIA: "remove one media",
	ADD_ONE_MEDIA: "add one media",
	ERROR: "error",
} as const;

/////////////////////////////////////////////

export const ElectronIpcMainProcessNotification = {
	TOGGLE_DEVELOPER_TOOLS: "toggle dev tools",
	TOGGLE_MAXIMIZE: "toggle maximize",
	RELOAD_WINDOW: "reload window",
	MINIMIZE: "minimize",
	QUIT_APP: "quit app",
} as const;
