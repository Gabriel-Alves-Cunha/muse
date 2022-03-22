import { getCurrent } from "@tauri-apps/api/window";

export const toggleMaximize = async () => {
	const currWindow = getCurrent();

	(await currWindow.isMaximized())
		? await currWindow.unmaximize()
		: await currWindow.maximize();
};
export const minimizeWindow = async () => await getCurrent().minimize();
export const closeWindow = async () => await getCurrent().close();

export const imageUrl = new URL(
	"../../assets/icons/logo.svg?width=16",
	import.meta.url,
);

// Putting this here so Vite can bundle it:
export const logoUrl = new URL("../../assets/icons/logo.png", import.meta.url);
