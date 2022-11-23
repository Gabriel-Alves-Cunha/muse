import type { Path } from "@common/@types/generalTypes";

import { errorToast, successToast } from "@components/toasts";
import { removeMedia } from "@contexts/usePlaylists";
import { getBasename } from "@common/path";
import { t } from "@components/I18n";

const { deleteFile: electronDeleteFile } = electron.fs;

export async function deleteFile(path: Path): Promise<void> {
	const wasDeleteSuccessfull = await electronDeleteFile(path);

	if (wasDeleteSuccessfull === true) {
		successToast(`${t("toasts.mediaDeletionSuccess")}"${getBasename(path)}"!`);

		removeMedia(path);
	} else
		errorToast(
			`${t("toasts.mediaDeletionError.beforePath")}"${path}"${t(
				"toasts.mediaDeletionError.afterPath",
			)}`,
		);
}
