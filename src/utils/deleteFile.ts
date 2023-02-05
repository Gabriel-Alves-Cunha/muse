import type { Path } from "types/generalTypes";

import { unlink } from "node:fs/promises";

import { errorToast, successToast } from "@components/toasts";
import { useTranslation } from "@i18n";
import { removeMedia } from "@contexts/usePlaylists";
import { getBasename } from "./path";

export async function deleteFile(path: Path): Promise<void> {
	const wasDeleteSuccessfull = await unlink(path)
		.then(() => true)
		.catch(() => false);
	const { t } = useTranslation.getState();

	if (wasDeleteSuccessfull) {
		successToast(`${t("toasts.mediaDeletionSuccess")}"${getBasename(path)}"!`);

		removeMedia(path);
	} else
		errorToast(
			`${t("toasts.mediaDeletionError.beforePath")}"${path}"${t(
				"toasts.mediaDeletionError.afterPath",
			)}`,
		);
}
