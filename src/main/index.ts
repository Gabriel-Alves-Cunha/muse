import type { ClipboardTextChangeNotificationProps } from "./preload";
import type { DownloadInfo } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";

import { normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { autoUpdater } from "electron-updater";
import {
	BrowserWindow,
	Notification,
	nativeImage,
	protocol,
	ipcMain,
	Tray,
	app,
} from "electron";

import { capitalizedAppName } from "@common/utils";
import { setupElectronMenu } from "./setupElectronMenu";
import { assertUnreachable } from "@utils/utils";
import { error, log } from "@common/log";
import { dbg } from "@common/debug";
import {
	ElectronPreloadToMainElectronMessageEnum,
	ElectronIpcMainProcessNotificationEnum,
	ElectronToReactMessageEnum,
} from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Auto updater setup:

autoUpdater.autoInstallOnAppQuit = true;
autoUpdater
	.on("update-not-available", (info) => log("Update not available:", info))
	.on("update-downloaded", (info) => log("Update downloaded:", info))
	.on("update-available", (info) => log("Update available:", info))
	.on("checking-for-update", () => log("Checking for update."))
	.on("error", (err) => log("Error in auto-updater.", err)).autoDownload = true;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Variables:

let electronWindow: BrowserWindow | undefined;
let tray: Tray | undefined;

const logoPath = resolve(
	app.getAppPath(),
	"build",
	"renderer",
	"assets",
	"logo.png",
);

/////////////////////////////////////////

function createElectronWindow(): BrowserWindow {
	const window = new BrowserWindow({
		title: capitalizedAppName,
		titleBarStyle: "hidden",
		icon: logoPath,

		frame: false,
		show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.

		minHeight: 500,
		minWidth: 315,
		height: 600,
		width: 800,

		webPreferences: {
			preload: isDev
				? resolve(app.getAppPath(), "preload.cjs")
				: resolve(app.getAppPath(), "build", "main", "preload.cjs"),
			allowRunningInsecureContent: false,
			contextIsolation: true, // <-- Needed to use contextBridge
			nodeIntegration: true,
			webSecurity: true,
			webgl: false,
		},
	}).once("ready-to-show", () => window.show());

	/////////////////////////////////////////

	setupElectronMenu(window);

	/////////////////////////////////////////

	const url = isDev
		? "http://localhost:3000"
		: pathToFileURL(
				resolve(app.getAppPath(), "build", "renderer", "index.html"),
		  ).toString();

	window.loadURL(url);

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
		electronWindow = createElectronWindow();

		/////////////////////////////////////////
		/////////////////////////////////////////
		// Tray setup:

		tray = new Tray(
			nativeImage.createFromPath(resolve(app.getAppPath(), "muse.png")),
		);
		tray.setToolTip("Music player and downloader");
		tray.setTitle("Muse");

		/////////////////////////////////////////
		/////////////////////////////////////////
		// App update:

		// This will download an update,
		// then install when the app quits.
		setTimeout(
			() => autoUpdater.checkForUpdatesAndNotify().catch(error),
			10_000,
		);

		/////////////////////////////////////////
		/////////////////////////////////////////
		/////////////////////////////////////////

		// Here you can include the rest of your app's specific main process
		// code. You can also put them in separate files and require them here.

		ipcMain.on(
			"notify",
			(
				event,
				type: ValuesOf<typeof ElectronIpcMainProcessNotificationEnum>,
			): void => {
				const focusedWindow = BrowserWindow.getFocusedWindow();

				switch (type) {
					case ElectronIpcMainProcessNotificationEnum.QUIT_APP: {
						focusedWindow?.close();
						break;
					}

					case ElectronIpcMainProcessNotificationEnum.TOGGLE_MAXIMIZE: {
						if (!focusedWindow) break;

						focusedWindow.isMaximized()
							? focusedWindow.unmaximize()
							: focusedWindow.maximize();
						break;
					}

					case ElectronIpcMainProcessNotificationEnum.MINIMIZE: {
						focusedWindow?.minimize();
						break;
					}

					case ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS: {
						focusedWindow?.webContents.toggleDevTools();
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

		ipcMain.handle(
			ElectronPreloadToMainElectronMessageEnum.CLIPBOARD_TEXT_CHANGED,
			(
				_event,
				{ artist, thumbnail, title, url }: ClipboardTextChangeNotificationProps,
			) =>
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
							imageURL: thumbnail,
							extension: "mp3",
							artist,
							title,
							url,
						};

						// Relay message from electronWindow to ipcRenderer:
						electronWindow?.webContents.send(
							ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
							downloadInfo,
						);

						dbg("Clicked notification and sent data:", downloadInfo);
					})
					.show(),
		);
	});
