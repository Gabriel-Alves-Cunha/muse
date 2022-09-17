import { ElectronIpcMainProcessNotification } from "@common/enums";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const toggleMaximize = () =>
	notify(ElectronIpcMainProcessNotification.TOGGLE_MAXIMIZE);

/////////////////////////////////////////////

export const minimizeWindow = () =>
	notify(ElectronIpcMainProcessNotification.MINIMIZE);

/////////////////////////////////////////////

export const closeWindow = () =>
	notify(ElectronIpcMainProcessNotification.QUIT_APP);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);
