import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";

const notify =
	electronApi.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const toggleMaximize = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE);

/////////////////////////////////////////////

export const minimizeWindow = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.MINIMIZE);

/////////////////////////////////////////////

export const closeWindow = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.QUIT_APP);
