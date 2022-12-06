import type { Path } from "@common/@types/generalTypes";

import { useI18n } from "@solid-primitives/i18n";

import { errorToast, successToast } from "@components/toasts";
import { removeMedia } from "@contexts/playlists";
import { getBasename } from "@common/path";

const { deleteFile: electronDeleteFile } = electron.fs;

export const deleteFile = async (path: Path): Promise<void> => {
	const wasDeleteSuccessfull = await electronDeleteFile(path);
	const [t] = useI18n();

	if (wasDeleteSuccessfull) {
		successToast(`${t("toasts.mediaDeletionSuccess")}"${getBasename(path)}"!`);

		removeMedia(path);
	} else
		errorToast(
			`${t("toasts.mediaDeletionError.beforePath")}"${path}"${t(
				"toasts.mediaDeletionError.afterPath",
			)}`,
		);
};
