import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";

const notify =
	electronApi.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const toggleMaximize = () =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE);

/////////////////////////////////////////////

export const minimizeWindow = () =>
	notify(ElectronIpcMainProcessNotificationEnum.MINIMIZE);

/////////////////////////////////////////////

export const closeWindow = () =>
	notify(ElectronIpcMainProcessNotificationEnum.QUIT_APP);
