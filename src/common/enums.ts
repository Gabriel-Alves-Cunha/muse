export enum ProgressStatus {
	WAITING_FOR_CONFIRMATION_FROM_ELECTRON =
		"WAITING_FOR_CONFIRMATION_FROM_ELECTRON",
	SUCCESS = "SUCCESS",
	ACTIVE = "ACTIVE",
	CANCEL = "CANCEL",
	FAILED = "FAILED",
}

/////////////////////////////////////////////

export enum ReactToElectronMessageEnum {
	CREATE_A_NEW_DOWNLOAD = "create a new download",
	CONVERT_MEDIA = "convert media",
	WRITE_TAG = "write tag",
	ERROR = "error",
}

/////////////////////////////////////////////

export enum ElectronToReactMessageEnum {
	DELETE_ONE_MEDIA_FROM_COMPUTER = "delete one media from computer",
	CREATE_A_NEW_DOWNLOAD = "create a new download",
	REFRESH_ALL_MEDIA = "refresh all media",
	REFRESH_ONE_MEDIA = "refresh one media",
	REMOVE_ONE_MEDIA = "remove one media",
	ADD_ONE_MEDIA = "add one media",
	ERROR = "error",
}

/////////////////////////////////////////////

export enum ElectronIpcMainProcessNotificationEnum {
	TOGGLE_DEVELOPER_TOOLS,
	TOGGLE_MAXIMIZE,
	RELOAD_WINDOW,
	MINIMIZE,
	QUIT_APP,
}
