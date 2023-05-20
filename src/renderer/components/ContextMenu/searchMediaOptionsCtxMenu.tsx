import type { Path } from "@common/@types/GeneralTypes";

import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { useState } from "react";

import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { selectT, useTranslator } from "@i18n";
import { getAllSelectedMedias } from "@contexts/allSelectedMedias";
import { getDataOfSearchMedia } from "../SearchMedia/state";
import { searchAndOpenLyrics } from "../MediaPlayer/Lyrics";
import { setFilesToShare } from "@contexts/filesToShare";
import { CenteredModal } from "../CenteredModal";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { OPEN_LYRICS } from "../MediaPlayer/Header/LoadOrToggleLyrics";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function SearchMediaOptionsCtxMenu({
	isAllDisabled,
}: Props): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslator(selectT);

	const closeMediaOptionsCtxMenu = (): void => setIsOpen(false);
	const openMediaOptionsCtxMenu = (): void => setIsOpen(true);

	return (
		<>
			<>
				<button
					onPointerUp={openMediaOptionsCtxMenu}
					disabled={isAllDisabled}
					data-menu-item
					type="button"
				>
					{t("ctxMenus.deleteMedia")}

					<RightSlot>
						<Trash />
					</RightSlot>
				</button>

				<CenteredModal isOpen={isOpen} setIsOpen={setIsOpen}>
					<DeleteMediaDialogContent
						closeDialog={closeMediaOptionsCtxMenu}
						handleDeleteMedia={deleteMedias}
					/>
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

export const shareMedias = (): void => setFilesToShare(getAllSelectedMedias());

/////////////////////////////////////////////

function selectAllMediasOnSearchResult(): void {
	const newFilesToShare = new Set<Path>();

	for (const [path] of getDataOfSearchMedia().results)
		newFilesToShare.add(path);

	setFilesToShare(newFilesToShare);
}

/////////////////////////////////////////////

export function searchForLyrics(): void {
	for (const path of getAllSelectedMedias())
		searchAndOpenLyrics(path, !OPEN_LYRICS);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { isAllDisabled: boolean };
