import type { Path } from "@common/@types/GeneralTypes";

import { errorToast, successToast } from "@components/toasts";
import { removeMedia } from "@contexts/playlists";
import { getBasename } from "@common/path";
import { t } from "@i18n";

const { deleteFile: electronDeleteFile } = electronApi.fs;

export async function deleteFile(path: Path): Promise<void> {
	const wasDeleteSuccessfully = await electronDeleteFile(path);

	if (wasDeleteSuccessfully) {
		successToast(`${t("toasts.mediaDeletionSuccess")}"${getBasename(path)}"!`);

		removeMedia(path);
	} else
		errorToast(
			`${t("toasts.mediaDeletionError.beforePath")}"${path}"${t(
				"toasts.mediaDeletionError.afterPath",
			)}`,
		);
}
