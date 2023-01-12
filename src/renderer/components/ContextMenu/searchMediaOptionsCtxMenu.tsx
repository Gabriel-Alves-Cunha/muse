import type { Path } from "@common/@types/generalTypes";

import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { useState } from "react";

import { getMainList, removeMedia } from "@contexts/usePlaylists";
import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { searchAndOpenLyrics } from "../MediaPlayer/Lyrics";
import { setFilesToShare } from "@contexts/filesToShare";
import { useTranslation } from "@i18n";
import { CenteredModal } from "../CenteredModal";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { getSearcher } from "../SearchMedia/state";
import { openLyrics } from "../MediaPlayer/Header/LoadOrToggleLyrics";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";
import { error } from "@common/log";
import {
	setAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/useAllSelectedMedias";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export default function SearchMediaOptionsCtxMenu({ isAllDisabled }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	return (
		<>
			<>
				<button
					onPointerUp={() => setIsOpen(true)}
					disabled={isAllDisabled}
					data-menu-item
				>
					{t("ctxMenus.deleteMedia")}

					<RightSlot>
						<Trash />
					</RightSlot>
				</button>

				<CenteredModal isOpen={isOpen} setIsOpen={setIsOpen}>
					<DeleteMediaDialogContent handleDeleteMedia={deleteMedias} />
				</CenteredModal>
			</>

			<MenuItem onPointerUp={shareMedias} disabled={isAllDisabled}>
				{t("ctxMenus.shareMedia")}

				<RightSlot>
					<Share />
				</RightSlot>
			</MenuItem>

			<MenuItem
				onPointerUp={selectAllMediasOnSearchResult}
				disabled={isAllDisabled}
			>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
			</MenuItem>

			<MenuItem onPointerUp={searchForLyrics} disabled={isAllDisabled}>
				{t("ctxMenus.searchForLyrics")}
			</MenuItem>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export function shareMedias() {
	const filePathsToShare: Set<Path> = new Set();
	const allMedias = getMainList();

	for (const id of getAllSelectedMedias()) {
		const path = allMedias.get(id)?.path;

		if (!path) {
			error(`There is no media with id: "${id}"!`);
			// setTimeout here so it doesn't run all the
			// possible removeMedia(id) fns now, delaying
			// the user.
			setTimeout(() => removeMedia(id), 1_000);
			continue;
		}

		filePathsToShare.add(path);
	}

	setFilesToShare(filePathsToShare);
}

/////////////////////////////////////////////

function selectAllMediasOnSearchResult(): void {
	const paths = getSearcher().results.map(([path]) => path);

	setAllSelectedMedias(new Set(paths));
}

/////////////////////////////////////////////

export function searchForLyrics(): void {
	for (const id of getAllSelectedMedias())
		searchAndOpenLyrics(id, !openLyrics).then();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { isAllDisabled: boolean };
