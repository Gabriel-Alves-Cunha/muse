import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

export const toggleMaximize = () =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE);
export const minimizeWindow = () =>
	notify(ElectronIpcMainProcessNotificationEnum.MINIMIZE);
export const closeWindow = () =>
	notify(ElectronIpcMainProcessNotificationEnum.QUIT_APP);

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);
