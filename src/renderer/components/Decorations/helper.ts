const notify = electron.notificationApi.sendNotificationToElectron;

export const toggleMaximize = () => notify({ type: "maximize" });
export const minimizeWindow = () => notify({ type: "minimize" });
export const closeWindow = () => notify({ type: "quitApp" });

export const handleMaximizeOnDoubleClick = (
	e: React.MouseEvent<HTMLElement, MouseEvent>,
) => {
	e.preventDefault();

	if (e.detail === 2) toggleMaximize();
	// ^ if double click.
};

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);
