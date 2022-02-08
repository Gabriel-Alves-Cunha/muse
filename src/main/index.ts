import type { IpcMainInvokeEvent } from "electron";

import { validateURL, getBasicInfo } from "ytdl-core";
import { NotificationType } from "@common/@types/typesAndEnums";
import { pathToFileURL } from "url";
import { getInfo } from "ytdl-core";
import { join } from "path";
import { get } from "https";
import {
	BrowserWindow,
	Notification,
	nativeImage,
	MenuItem,
	ipcMain,
	Menu,
	Tray,
	app,
} from "electron";

import { capitalizedAppName, isDevelopment } from "@common/utils";
import { logoPath } from "./utils.js";

let electronWindow: BrowserWindow | undefined;
let tray: Tray | undefined;

function createWindow() {
	const window = new BrowserWindow({
		title: capitalizedAppName,
		titleBarStyle: "hidden",
		icon: logoPath,
		frame: false,
		height: 600,
		show: false,
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
					accelerator: "CommandOrControl+shift+i",
					role: "toggleDevTools",
					click() {
						window.webContents.isDevToolsOpened()
							? window.webContents.openDevTools()
							: window.webContents.closeDevTools();
					},
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

	window.loadURL(url);

	if (isDevelopment) window.webContents.openDevTools();

	return window;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
	electronWindow = createWindow();
	tray = new Tray(nativeImage.createFromPath(logoPath));
	tray.setToolTip("Music player and downloader");
	tray.setTitle("Muse");

	try {
		const extendedClipboard = (await import("./clipboardExtended"))
			.ExtendedClipboard as ClipboardExtended;

		extendedClipboard
			.on("text-changed", async () => {
				const txt = extendedClipboard.readText("clipboard");

				if (validateURL(txt)) {
					try {
						const {
							videoDetails: { title, thumbnails },
						} = await getBasicInfo(txt);

						const notification = new Notification({
							title: "Click to download this video as 'mp3'",
							timeoutType: "never",
							urgency: "normal",
							icon: logoPath,
							silent: true,
							body: title,
						});

						notification.on("click", () => {
							console.log("Clicked notification!");

							// Send msg to ipcRenderer:
							electronWindow?.webContents.send("async-msg", {
								type: "download media",
								params: {
									imageURL: thumbnails.at(-1)?.url ?? "",
									type: "download media",
									canStartDownload: true,
									url: txt,
									title,
								},
							});
						});

						notification.show();
					} catch (error) {
						console.error(error);
					}
				}
			})
			.startWatching();
	} catch (error) {
		console.error(error);
	}

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	// Quit when all windows are closed, except on macOS. There, it's common
	// for applications and their menu bar to stay active until the user quits
	// explicitly with Cmd + Q.
	app.on("window-all-closed", () => {
		if (process.platform !== "darwin") app.quit();
	});
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on(
	"notify",
	(
		event,
		object: Readonly<{
			type: NotificationType;
			msg?: string;
		}>,
	) => {
		switch (object.type) {
			case NotificationType.QUIT_APP: {
				app.quit();
				break;
			}

			case NotificationType.MAXIMIZE: {
				BrowserWindow.getFocusedWindow()?.isMaximized()
					? BrowserWindow.getFocusedWindow()?.unmaximize()
					: BrowserWindow.getFocusedWindow()?.maximize();
				break;
			}

			case NotificationType.MINIMIZE: {
				BrowserWindow.getFocusedWindow()?.minimize();
				break;
			}

			default: {
				console.error(
					"This 'notify' event has no receiver function!\nEvent =",
					event,
				);
				break;
			}
		}
	},
);

ipcMain.handle(
	"get-image",
	async (_event: IpcMainInvokeEvent, url: string): Promise<string | Error> => {
		return new Promise((resolve, reject) => {
			get(url, resp => {
				resp.setEncoding("base64");

				let body = "data:" + resp.headers["content-type"] + ";base64,";

				resp.on("data", chunk => (body += chunk));
				resp.on("end", () => resolve(body));
			}).on("error", e => {
				console.error(`Got error getting image on Electron side: ${e.message}`);
				reject(e);
			});
		});
	},
);

ipcMain.handle(
	"get-info-ytdl",
	async (_event: IpcMainInvokeEvent, url: string) => await getInfo(url),
);

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
