import type { Path } from "types/generalTypes";

import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { useState } from "react";

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
	const filePathsToShare: Set<Path> = new Set();

	for (const path of getAllSelectedMedias()) filePathsToShare.add(path);

	setFilesToShare(filePathsToShare);
}

/////////////////////////////////////////////

function selectAllMediasOnSearchResult(): void {
	const paths = getSearcher().results.map(([path]) => path);

	setAllSelectedMedias(new Set(paths));
}

/////////////////////////////////////////////

export function searchForLyrics(): void {
	for (const path of getAllSelectedMedias())
		searchAndOpenLyrics(path, !openLyrics).then();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { isAllDisabled: boolean };
