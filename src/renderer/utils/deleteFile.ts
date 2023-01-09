import type { Path } from "@common/@types/generalTypes";

import { errorToast, successToast } from "@components/toasts";
import { useTranslation } from "@i18n";
import { removeMedia } from "@contexts/usePlaylists";
import { getBasename } from "@common/path";

const { deleteFile: electronDeleteFile } = electron.fs;

const { t } = useTranslation();

export async function deleteFile(path: Path): Promise<void> {
	const wasDeleteSuccessfull = await electronDeleteFile(path);

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
