import type { AxiosRequestConfig } from "axios";
import type { IpcMainInvokeEvent } from "electron";
import type { NotificationType } from "@common/@types/electron-window";

import { validateURL, getBasicInfo } from "ytdl-core";
import { pathToFileURL } from "url";
import { getInfo } from "ytdl-core";
import { join } from "path";
import axios from "axios";
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

import { isDevelopment } from "@common/utils";
import { logoPath } from "./utils";

var electronWindow: Electron.BrowserWindow | undefined;
var tray: Electron.Tray | undefined;

function createWindow() {
	const window = new BrowserWindow({
		titleBarStyle: "hidden",
		icon: logoPath,
		title: "Muse",
		frame: false,
		height: 600,
		show: false,
		width: 800,
		webPreferences: {
			preload: join(__dirname, "preload.js"),
			allowRunningInsecureContent: false,
			contextIsolation: true, // <-- Needed to use contextBridge :(
			nodeIntegration: true,
			webSecurity: true, // <-- I needed this for ytdl to work :(
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
		})
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
		})
	);
	Menu.setApplicationMenu(menu);

	const url = isDevelopment
		? "http://localhost:3000"
		: pathToFileURL(join(__dirname, "./renderer/index.html")).toString();

	window.loadURL(url);

	if (isDevelopment) window.webContents.openDevTools();

	return window;
}

const createTrayIcon = () => {
	const tray = new Tray(nativeImage.createFromPath(logoPath));
	tray.setToolTip("Music player and downloader");
	tray.setTitle("Muse");

	return tray;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	electronWindow = createWindow();
	tray = createTrayIcon();

	const clipboard = require("electron-clipboard-extended");
	clipboard
		.on("text-changed", async () => {
			const txt = clipboard.readText("clipboard");

			if (validateURL(txt)) {
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
							imageURL: thumbnails.at(-1),
							type: "download media",
							canStartDownload: true,
							url: txt,
							title,
						},
					});
				});

				notification.show();
			}
		})
		.startWatching();

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
		}>
	) => {
		switch (object.type) {
			case "quitApp": {
				app.quit();
				break;
			}

			case "maximize": {
				BrowserWindow.getFocusedWindow()?.isMaximized()
					? BrowserWindow.getFocusedWindow()?.unmaximize()
					: BrowserWindow.getFocusedWindow()?.maximize();
				break;
			}

			case "minimize": {
				BrowserWindow.getFocusedWindow()?.minimize();
				break;
			}

			default: {
				console.error(
					"This 'notify' event has no receiver function!\nEvent =",
					event
				);
				break;
			}
		}
	}
);

ipcMain.handle(
	"request",
	async <T>(_event: IpcMainInvokeEvent, axiosConfig: AxiosRequestConfig<T>) =>
		await axios(axiosConfig)
);

ipcMain.handle(
	"get-info-ytdl",
	async (_event: IpcMainInvokeEvent, url: string) => await getInfo(url)
);
