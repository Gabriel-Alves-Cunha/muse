import type { DownloadInfo } from "@common/@types/generalTypes";

import { validateURL as isUrlValid, getBasicInfo } from "ytdl-core";
import { join, normalize } from "node:path";
import { pathToFileURL } from "node:url";
import { autoUpdater } from "electron-updater";
import {
	BrowserWindow,
	Notification,
	nativeImage,
	MenuItem,
	protocol,
	ipcMain,
	Menu,
	Tray,
	app,
} from "electron";

import { capitalizedAppName, dbg, isDevelopment } from "@common/utils";
import { assertUnreachable, time } from "@utils/utils";
import { logoPath } from "./utils";
import {
	ElectronIpcMainProcessNotificationEnum,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Auto updater setup:

autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoDownload = true;
autoUpdater
	.on("update-not-available", info =>
		dbg("Update not available:", info))
	.on("update-downloaded", info => dbg("Update downloaded:", info))
	.on("update-available", info =>
		dbg("Update available:", info))
	.on("checking-for-update", () => dbg("Checking for update..."))
	.on("error", err =>
		dbg("Error in auto-updater. ", err))
	.on("download-progress", progressObj => {
		dbg(
			`Download speed:  ${progressObj.bytesPerSecond} bytes/s. Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`,
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
	return await time(async () => {
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
				preload: join(__dirname, "preload.js"),
				allowRunningInsecureContent: false,
				contextIsolation: true, // <-- Needed to use contextBridge
				nodeIntegration: true,
				webSecurity: true,
				webgl: false,
			},
		})
			.once("ready-to-show", () => {
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
				submenu: [{
					click: () => window.reload(),
					accelerator: "f5",
					role: "reload",
				}],
			}),
		);

		menu.append(
			new MenuItem({
				label: "Open/close Dev Tools",
				submenu: [{
					click: () =>
						window
							.webContents
							.toggleDevTools(),
					accelerator: "CommandOrControl+shift+i",
					role: "toggleDevTools",
				}],
			}),
		);

		Menu.setApplicationMenu(menu);

		/////////////////////////////////////////
		/////////////////////////////////////////

		const url = isDevelopment ?
			"http://localhost:3000" :
			pathToFileURL(join(__dirname, "vite-renderer-build", "index.html"))
				.toString();

		await window.loadURL(url);

		return window;
	}, "createElectronWindow");
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
	.whenReady()
	.then(async () => {
		await time(async () => {
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
			// TODO: there is something wrong with this lib:
			if (isDevelopment) {
				const devtoolsInstaller = await import("electron-devtools-installer");
				const { REACT_DEVELOPER_TOOLS } = devtoolsInstaller;
				// @ts-ignore => this is a workaround for a bug in the lib:
				const { default: installExtension } = devtoolsInstaller.default;

				console.log({ installExtension });

				await installExtension(REACT_DEVELOPER_TOOLS, {
					loadExtensionOptions: { allowFileAccess: true },
				}) // @ts-ignore => this is a workaround for a bug in the lib
					.then(name => console.log(`Added Extension: ${name}`))
					// @ts-ignore => this is a workaround for a bug in the lib
					.catch(err =>
						console.error("An error occurred while installing extension: ", err)
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

			// This is to make Electron show a notification
			// when we copy a link to the clipboard:
			try {
				// This has to be imported after app is open.
				const extendedClipboard = (await import("./clipboardExtended"))
					.extendedClipboard as ClipboardExtended;

				extendedClipboard
					.on("text-changed", async () => {
						const url = extendedClipboard.readText("clipboard");

						if (!isUrlValid(url)) return;

						const { title, thumbnails, media: { artist = "" } } =
							(await getBasicInfo(url)).videoDetails;

						new Notification({
							title: "Click to download this media as 'mp3'",
							timeoutType: "never",
							urgency: "normal",
							icon: logoPath,
							silent: true,
							body: title,
						})
							.on("click", () => {
								const downloadInfo: DownloadInfo = {
									imageURL: thumbnails.at(-1)?.url ?? "",
									extension: "mp3",
									artist,
									title,
									url,
								};

								// Send msg to ipcMain, wich in turn will relay to ipcRenderer:
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								electronWindow!.webContents.send(
									ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
									downloadInfo,
								);

								dbg("Clicked notification and sent data:", downloadInfo);
							})
							.show();
					})
					.startWatching();
			} catch (error) {
				console.error(error);
			}

			/////////////////////////////////////////

			// This will immediately download an update,
			// then install when the app quits.
			setTimeout(
				async () =>
					await autoUpdater.checkForUpdatesAndNotify().catch(console.error),
				5_000,
			);
		}, "app.whenReady.then");
	});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Relay message from electronWindow to ipcRenderer:
ipcMain.on(
	ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
	(_e, downloadValues: DownloadInfo) => {
		dbg("ipcMain received data from electronWindow:", downloadValues);

		ipcMain.emit(
			ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
			downloadValues,
		);
	},
);

/////////////////////////////////////////
/////////////////////////////////////////

ipcMain.on(
	"notify",
	(event, type: ElectronIpcMainProcessNotificationEnum): void => {
		switch (type) {
			case ElectronIpcMainProcessNotificationEnum.QUIT_APP: {
				app.quit();
				break;
			}

			case ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE: {
				const focusedWindow = BrowserWindow.getFocusedWindow();
				if (!focusedWindow) break;

				focusedWindow.isMaximized() ?
					focusedWindow.unmaximize() :
					focusedWindow.maximize();
				break;
			}

			case ElectronIpcMainProcessNotificationEnum.MINIMIZE: {
				BrowserWindow.getFocusedWindow()?.minimize();
				break;
			}

			case ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS: {
				BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools();
				break;
			}

			case ElectronIpcMainProcessNotificationEnum.RELOAD_WINDOW: {
				BrowserWindow.getFocusedWindow()?.reload();
				break;
			}

			default: {
				console.error(
					"This 'notify' event has no receiver function on 'ipcMain'!\nEvent =",
					event,
				);

				assertUnreachable(type);
			}
		}
	},
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

// Also defining it here with all types required so typescript doesn't complain...
type ClipboardExtended = Electron.Clipboard & {
	startWatching: () => ClipboardExtended;
	stopWatching: () => ClipboardExtended;
	off: <T>(
		event: string,
		listener?: (...args: T[]) => void,
	) => ClipboardExtended;
	on: <T>(event: string, listener: (...args: T[]) => void) => ClipboardExtended;
	once: <T>(
		event: string,
		listener: (...args: T[]) => void,
	) => ClipboardExtended;
};
