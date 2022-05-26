import type { DownloadInfo } from "@common/@types/generalTypes";

import { validateURL, getBasicInfo } from "ytdl-core";
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
import { assertUnreachable } from "@utils/utils";
import { logoPath } from "./utils";
import {
	ElectronIpcMainProcessNotificationEnum,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";

//------------------------------------------------
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoDownload = true;
autoUpdater.on("checking-for-update", () => {
	dbg("Checking for update...");
});
autoUpdater.on("update-available", info => {
	dbg("Update available:", info);
});
autoUpdater.on("update-not-available", info => {
	dbg("Update not available:", info);
});
autoUpdater.on("error", err => {
	dbg("Error in auto-updater. ", err);
});
autoUpdater.on("download-progress", progressObj => {
	dbg({ progressObj });
	const log_message = `Download speed:  ${progressObj.bytesPerSecond} bytes/s. Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;

	dbg(log_message);
});
autoUpdater.on("update-downloaded", info => {
	dbg("Update downloaded:", info);
});
//-------------------------------------------------

let electronWindow: BrowserWindow | undefined;
let tray: Tray | undefined;

async function createWindow() {
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
	}).once("ready-to-show", () => {
		window.show();
		window.focus();
	});

	const menu = new Menu();
	menu.append(
		new MenuItem({
			label: "Refresh Page",
			submenu: [
				{
					click: () => window.reload(),
					accelerator: "f5",
					role: "reload",
				},
			],
		}),
	);
	menu.append(
		new MenuItem({
			label: "Open/close Dev Tools",
			submenu: [
				{
					click: () => window.webContents.toggleDevTools(),
					accelerator: "CommandOrControl+shift+i",
					role: "toggleDevTools",
				},
			],
		}),
	);
	Menu.setApplicationMenu(menu);

	const url = isDevelopment
		? "http://localhost:3000"
		: pathToFileURL(
				join(__dirname, "vite-renderer-build", "index.html"),
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
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	})
	.whenReady()
	.then(async () => {
		// This is so Electron can load local media files:
		protocol.registerFileProtocol("atom", (request, callback) => {
			const url = request.url.substring(7);
			callback(decodeURI(normalize(url)));
		});

		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.

		// TODO: there is something wrong with this lib:
		if (isDevelopment) {
			const devtoolsInstaller = await import("electron-devtools-installer");
			const { REACT_DEVELOPER_TOOLS } = devtoolsInstaller;
			// @ts-ignore - this is a workaround for a bug in the lib
			const { default: installExtension } = devtoolsInstaller.default;

			console.log({ installExtension });

			await installExtension(REACT_DEVELOPER_TOOLS, {
				loadExtensionOptions: { allowFileAccess: true },
			})
				// @ts-ignore - this is a workaround for a bug in the lib
				.then(name => console.log(`Added Extension: ${name}`))
				// @ts-ignore - this is a workaround for a bug in the lib
				.catch(err =>
					console.error("An error occurred while installing extension: ", err),
				);
		}

		electronWindow = await createWindow();
		tray = new Tray(nativeImage.createFromPath(logoPath));
		tray.setToolTip("Music player and downloader");
		tray.setTitle("Muse");

		try {
			const extendedClipboard = (await import("./clipboardExtended"))
				.ExtendedClipboard as ClipboardExtended;

			extendedClipboard
				.on("text-changed", async () => {
					const url = extendedClipboard.readText("clipboard");

					if (validateURL(url))
						try {
							const { title, thumbnails } = (await getBasicInfo(url))
								.videoDetails;

							new Notification({
								title: "Click to download this video as 'mp3'",
								timeoutType: "never",
								urgency: "normal",
								icon: logoPath,
								silent: true,
								body: title,
							})
								.on("click", () => {
									const downloadInfo: DownloadInfo = {
										imageURL: thumbnails.at(-1)?.url ?? "",
										canStartDownload: true,
										extension: "mp3",
										title,
										url,
									};

									// Send msg to ipcMain:
									electronWindow?.webContents.send(
										ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
										downloadInfo,
									);

									console.log(
										"Clicked notification and sent data:",
										downloadInfo,
									);
								})
								.show();
						} catch (error) {
							console.error(error);
						}
				})
				.startWatching();
		} catch (error) {
			console.error(error);
		}

		setTimeout(async () => {
			try {
				// This will immediately download an update,
				// then install when the app quits.
				await autoUpdater.checkForUpdatesAndNotify();
			} catch (error) {
				console.error(error);
			}
		}, 3_000);
	});

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

ipcMain.on("notify", (event, type: ElectronIpcMainProcessNotificationEnum) => {
	switch (type) {
		case ElectronIpcMainProcessNotificationEnum.QUIT_APP: {
			app.quit();
			break;
		}

		case ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE: {
			const focusedWindow = BrowserWindow.getFocusedWindow();
			if (!focusedWindow) break;

			focusedWindow.isMaximized()
				? focusedWindow.unmaximize()
				: focusedWindow.maximize();
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
			break;
		}
	}
});

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
