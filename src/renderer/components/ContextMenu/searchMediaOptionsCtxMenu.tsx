import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { useSnapshot } from "valtio";
import { useState } from "react";

import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { searchAndOpenLyrics } from "../MediaPlayer/Lyrics";
import { allSelectedMedias } from "@contexts/allSelectedMedias";
import { CenteredModal } from "../CenteredModal";
import { filesToShare } from "@contexts/filesToShare";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { translation } from "@i18n";
import { openLyrics } from "../MediaPlayer/Header/LoadOrToggleLyrics";
import { RightSlot } from "../RightSlot";
import { searcher } from "../SearchMedia/state";
import { MenuItem } from "../MenuItem";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function SearchMediaOptionsCtxMenu({ isAllDisabled }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const t = useSnapshot(translation).t;

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
					<DeleteMediaDialogContent
						closeDialog={() => setIsOpen(false)}
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

export function shareMedias() {
	for (const path of allSelectedMedias) filesToShare.add(path);
}

/////////////////////////////////////////////

function selectAllMediasOnSearchResult(): void {
	for (const [path] of searcher.results) allSelectedMedias.add(path);
}

/////////////////////////////////////////////

export function searchForLyrics(): void {
	for (const path of allSelectedMedias) searchAndOpenLyrics(path, !openLyrics);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { isAllDisabled: boolean };
