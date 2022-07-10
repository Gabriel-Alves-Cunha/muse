import type { Path } from "@common/@types/generalTypes";

import { errorToast, successToast } from "@styles/global";
import { getBasename } from "@common/path";
import {
	PlaylistActions,
	setPlaylists,
	WhatToDo,
} from "@contexts/mediaHandler/usePlaylists";

const { deleteFile } = electron.fs;

export async function deleteMedia(path: Path) {
	const wasDeleteSuccessfull = await deleteFile(path);

	if (wasDeleteSuccessfull) {
		successToast(`Deleted ${getBasename(path)}`);

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			path,
		});
	} else {
		errorToast(
			`Could not delete ${path}\nSee console by pressing 'Ctrl' + 'Shift' + 'i'.`,
		);
	}
}
