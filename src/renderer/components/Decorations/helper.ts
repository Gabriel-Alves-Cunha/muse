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
