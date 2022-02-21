import { NotificationType } from "@common/@types/typesAndEnums";

const notify = electron.notificationApi.sendNotificationToElectron;

export const toggleMaximize = () => notify({ type: NotificationType.MAXIMIZE });
export const minimizeWindow = () => notify({ type: NotificationType.MINIMIZE });
export const closeWindow = () => notify({ type: NotificationType.QUIT_APP });

export const handleMaximizeOnDoubleClick = (
	e: React.MouseEvent<HTMLElement, MouseEvent>,
) => {
	e.preventDefault();

	if (e.detail === 2 && !(e.detail > 2)) toggleMaximize();
	// ^ if double click.
};

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);

// Putting this here so Vite can bundle it:
export const logoUrl = new URL("../../assets/icons/logo.png", import.meta.url);
