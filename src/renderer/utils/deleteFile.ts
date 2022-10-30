import type { Path } from "@common/@types/generalTypes";

import { errorToast, successToast } from "@components/toasts";
import { getBasename } from "@common/path";
import { t } from "@components/I18n";
import {
	PlaylistActions,
	setPlaylists,
	WhatToDo,
} from "@contexts/usePlaylists";

const { deleteFile: ElectronDeleteFile } = electron.fs;

export async function deleteFile(path: Path): Promise<void> {
	const wasDeleteSuccessfull = await ElectronDeleteFile(path);

	if (wasDeleteSuccessfull === true) {
		successToast(`${t("toasts.mediaDeletionSuccess")}"${getBasename(path)}"!`);

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			path,
		});
	} else
		errorToast(
			`${t("toasts.mediaDeletionError.beforePath")}"${path}"${
				t("toasts.mediaDeletionError.afterPath")
			}`,
		);
}
