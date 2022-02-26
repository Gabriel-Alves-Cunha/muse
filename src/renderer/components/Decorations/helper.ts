import { NotificationEnum } from "@common/@types/typesAndEnums";

const notify = electron.notificationApi.sendNotificationToElectron;

export const toggleMaximize = () => notify({ type: NotificationEnum.MAXIMIZE });
export const minimizeWindow = () => notify({ type: NotificationEnum.MINIMIZE });
export const closeWindow = () => notify({ type: NotificationEnum.QUIT_APP });

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);

// Putting this here so Vite can bundle it:
export const logoUrl = new URL("../../assets/icons/logo.png", import.meta.url);
