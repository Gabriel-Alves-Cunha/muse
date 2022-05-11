import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

export const toggleMaximize = () =>
	notify({ type: ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE });
export const minimizeWindow = () =>
	notify({ type: ElectronIpcMainProcessNotificationEnum.MINIMIZE });
export const closeWindow = () =>
	notify({ type: ElectronIpcMainProcessNotificationEnum.QUIT_APP });

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);
