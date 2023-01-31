import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { appWindow } from "@tauri-apps/api/window";

import { capitalizedAppName } from "@utils/utils";
import { log } from "@utils/log";

import museLogoPath from "@assets/logo.png";

export async function setupWindow() {
	await appWindow.setDecorations(false);

	await appWindow.setIcon(museLogoPath);

	await appWindow.setTitle(capitalizedAppName);

	setTimeout(async () => {
		// if (isDev) return;

		const update = await checkUpdate();

		if (update.shouldUpdate) {
			log(
				`Installing update ${update.manifest?.version}, ${update.manifest?.date}, ${update.manifest?.body}`,
			);

			await installUpdate();
		}
	}, 10_000);
}
