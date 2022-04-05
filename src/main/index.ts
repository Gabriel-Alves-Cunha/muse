import { validateURL, getBasicInfo } from "ytdl-core";
import { pathToFileURL } from "url";
import { join } from "path";
import installExtension, {
	REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
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
import { NotificationEnum } from "@common/@types/typesAndEnums";
import { logoPath } from "./utils.js";

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
		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.

		await installExtension(REACT_DEVELOPER_TOOLS, {
			loadExtensionOptions: { allowFileAccess: true },
		})
			.then(name => console.log(`Added Extension: ${name}`))
			.catch(err =>
				console.error("An error occurred while installing extension: ", err),
			);

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

					if (validateURL(url)) {
						try {
							const {
								videoDetails: { title, thumbnails },
							} = await getBasicInfo(url);

							new Notification({
								title: "Click to download this video as 'mp3'",
								timeoutType: "never",
								urgency: "normal",
								icon: logoPath,
								silent: true,
								body: title,
							})
								.on("click", () => {
									console.log("Clicked notification!");

									// Send msg to ipcRenderer:
									electronWindow?.webContents.send("async-msg", {
										type: NotificationEnum.DOWNLOAD_MEDIA,
										params: {
											imageURL: thumbnails.at(-1)?.url ?? "",
											type: "download media",
											canStartDownload: true,
											title,
											url,
										},
									});
								})
								.show();
						} catch (error) {
							console.error(error);
						}
					}
				})
				.startWatching();
		} catch (error) {
			console.error(error);
		}
	});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on(
	"notify",
	(
		event,
		object: Readonly<{
			type: NotificationEnum;
		}>,
	) => {
		switch (object.type) {
			case NotificationEnum.QUIT_APP: {
				app.quit();
				break;
			}

			case NotificationEnum.MAXIMIZE: {
				const focusedWindow = BrowserWindow.getFocusedWindow();
				if (!focusedWindow) break;

				focusedWindow.isMaximized()
					? focusedWindow.unmaximize()
					: focusedWindow.maximize();
				break;
			}

			case NotificationEnum.MINIMIZE: {
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
