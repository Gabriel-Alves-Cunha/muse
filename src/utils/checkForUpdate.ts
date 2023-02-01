import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";

import { log } from "@utils/log";

export async function checkForUpdate() {
	// if (isDev) return;

	const update = await checkUpdate();

	if (update.shouldUpdate) {
		log(
			`Installing update ${update.manifest?.version}, ${update.manifest?.date}, ${update.manifest?.body}`,
		);

		await installUpdate();
	}
}
