import type { ClipboardExtended } from "./preload/clipboardExtended";
import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { clearLine, cursorTo } from "node:readline";
import { normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { autoUpdater } from "electron-updater";
import { error } from "node:console";
import {
	BrowserWindow,
	nativeImage,
	MenuItem,
	protocol,
	ipcMain,
	Menu,
	Tray,
	app,
} from "electron";

import { capitalizedAppName } from "@common/utils";
import { assertUnreachable } from "@utils/utils";
import { logoPath } from "./utils";
import { dbg } from "@common/debug";
import {
	electronIpcMainProcessNotification,
	electronToReactMessage,
} from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Auto updater setup:

autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoDownload = true;
autoUpdater
	.on("update-not-available", (info) => dbg("Update not available:", info))
	.on("update-downloaded", (info) => dbg("Update downloaded:", info))
	.on("update-available", (info) => dbg("Update available:", info))
	.on("checking-for-update", () => dbg("Checking for update..."))
	.on("error", (err) => dbg("Error in auto-updater. ", err))
	.on("download-progress", (progressObj) => {
		cursorTo(process.stdout, 0);
		clearLine(process.stdout, 0);
		process.stdout.write(
			`Download speed: ${progressObj.bytesPerSecond} bytes/s. Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`,
		);
	});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Variables:

let electronWindow: BrowserWindow | undefined;
let tray: Tray | undefined;

/////////////////////////////////////////

async function createElectronWindow(): Promise<BrowserWindow> {
	const window = new BrowserWindow({
		title: capitalizedAppName,
		titleBarStyle: "hidden",
		icon: logoPath,

		frame: false,
		show: false,

		minHeight: 500,
		minWidth: 315,
		height: 600,
		width: 800,

		webPreferences: {
			preload: resolve(app.getAppPath(), "preload.cjs"),
			allowRunningInsecureContent: false,
			contextIsolation: true, // <-- Needed to use contextBridge
			nodeIntegration: true,
			webSecurity: true,
			webgl: false,
		},
	}).once("ready-to-show", () => {
		window.show();
		window.focus();
	});

	/////////////////////////////////////////
	/////////////////////////////////////////
	// Setup Electron global keyboard shortcuts:

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

	/////////////////////////////////////////
	/////////////////////////////////////////

	const url = isDev
		? "http://localhost:3000"
		: pathToFileURL(
				resolve(app.getAppPath(), "..", "renderer", "index.html"),
		  ).toString();

	await window.loadURL(url);

	return window;
}

app
	.on("window-all-closed", () => {
		// Quit when all windows are closed, except on macOS. There, it's common
		// for applications and their menu bar to stay active until the user quits
		// explicitly with Cmd + Q.
		if (process.platform !== "darwin") app.quit();
	})
	.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createElectronWindow();
	})
	.on("ready", async () => {
		// This is so Electron can load local media files:
		protocol.registerFileProtocol("atom", (request, callback) => {
			const url = request.url.substring(7);
			callback(decodeURI(normalize(url)));
		});

		/////////////////////////////////////////
		/////////////////////////////////////////

		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs:
		if (isDev) {
			const devtoolsInstaller = await import("electron-devtools-installer");
			const { REACT_DEVELOPER_TOOLS } = devtoolsInstaller;
			// @ts-ignore => This error occurs when not bundling.
			const { default: installExtension } = devtoolsInstaller.default;
			// const installExtension = devtoolsInstaller.default;

			await installExtension(REACT_DEVELOPER_TOOLS, {
				loadExtensionOptions: { allowFileAccess: true },
			})
				// @ts-ignore => This error occurs when not bundling.
				.then((name) => dbg(`Added Extension: ${name}`))
				// @ts-ignore => This error occurs when not bundling.
				.catch((err) =>
					error("An error occurred while installing extension: ", err),
				);
		}

		/////////////////////////////////////////
		/////////////////////////////////////////

		// This variable is needed to hold a reference to the window,
		// so it doesn't get garbge collected:
		electronWindow = await createElectronWindow();

		/////////////////////////////////////////
		/////////////////////////////////////////

		// Tray setup:
		tray = new Tray(nativeImage.createFromPath(logoPath));
		tray.setToolTip("Music player and downloader");
		tray.setTitle("Muse");

		/////////////////////////////////////////
		/////////////////////////////////////////

		// This will download an update,
		// then install when the app quits.
		setTimeout(
			async () => await autoUpdater.checkForUpdatesAndNotify().catch(error),
			10_000,
		);
	});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain
	.on(
		// Relay message from electronWindow to ipcRenderer:
		electronToReactMessage.CREATE_A_NEW_DOWNLOAD,
		(_, downloadValues: DownloadInfo) => {
			dbg("ipcMain received data from electronWindow:", downloadValues);

			ipcMain.emit(
				electronToReactMessage.CREATE_A_NEW_DOWNLOAD,
				downloadValues,
			);
		},
	)
	/////////////////////////////////////////
	.on(
		"notify",
		(
			event,
			type: ValuesOf<typeof electronIpcMainProcessNotification>,
		): void => {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			switch (type) {
				case electronIpcMainProcessNotification.QUIT_APP: {
					app.quit();
					break;
				}

				case electronIpcMainProcessNotification.TOGGLE_MAXIMIZE: {
					if (!focusedWindow) break;

					focusedWindow.isMaximized()
						? focusedWindow.unmaximize()
						: focusedWindow.maximize();
					break;
				}

				case electronIpcMainProcessNotification.MINIMIZE: {
					focusedWindow?.minimize();
					break;
				}

				case electronIpcMainProcessNotification.TOGGLE_DEVELOPER_TOOLS: {
					focusedWindow?.webContents.toggleDevTools();
					break;
				}

				case electronIpcMainProcessNotification.RELOAD_WINDOW: {
					focusedWindow?.reload();
					break;
				}

				default: {
					error(
						"This 'notify' event has no receiver function on 'ipcMain'!\nEvent =",
						event,
					);

					assertUnreachable(type);
				}
			}
		},
	);
