import { BrowserWindow, Menu, MenuItem } from "electron";

/* Setup Electron global keyboard shortcuts. */
export function setupElectronMenu(window: BrowserWindow): void {
	const menu = new Menu();

	menu.append(
		new MenuItem({
			label: "Refresh Page",
			submenu: [
				{
					accelerator: "f5",
					role: "reload",
					click() {
						window.reload();
					},
				},
			],
		}),
	);

	menu.append(
		new MenuItem({
			label: "Open/close Dev Tools",
			submenu: [
				{
					role: "toggleDevTools",
					accelerator: "f12",
					click() {
						window.webContents.toggleDevTools();
					},
				},
			],
		}),
	);

	Menu.setApplicationMenu(menu);
}
