import type { Path } from "@common/@types/generalTypes";

import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Suspense } from "react";

import { searchAndOpenLyrics } from "../MediaPlayer/Lyrics";
import { setFilesToShare } from "@contexts/filesToShare";
import { useTranslation } from "@i18n";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { getMainList } from "@contexts/usePlaylists";
import { getSearcher } from "../SearchMedia/state";
import { openLyrics } from "../MediaPlayer/Header/LoadOrToggleLyrics";
import { RightSlot } from "./RightSlot";
import { Item } from "./Item";
import {
	setAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/useAllSelectedMedias";
import {
	CenteredModalContent,
	CenteredModalTrigger,
} from "@components/CenteredModal";
import DeleteMediaDialogContent from "@components/DeleteMediaDialog";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

const deleteMediaModalID_searchMediaCtxMenu =
	"delete-media-modal-search-media-ctx-menu";

export default function SearchMediaOptionsCtxMenu({ isAllDisabled }: Props) {
	const { t } = useTranslation();

	return (
		<>
			<>
				<CenteredModalTrigger
					htmlTargetName={deleteMediaModalID_searchMediaCtxMenu}
					inputProps={{ disabled: isAllDisabled }}
					labelClassName="ctx-menu-item"
				>
					{t("ctxMenus.deleteMedia")}

					<RightSlot>
						<Trash />
					</RightSlot>
				</CenteredModalTrigger>

				<CenteredModalContent htmlFor={deleteMediaModalID_searchMediaCtxMenu}>
					<Suspense>
						<DeleteMediaDialogContent
							idOfModalToBeClosed={deleteMediaModalID_searchMediaCtxMenu}
							handleMediaDeletion={deleteMedias}
						/>
					</Suspense>
				</CenteredModalContent>
			</>

			<Item onSelect={shareMedias} disabled={isAllDisabled}>
				{t("ctxMenus.shareMedia")}

				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
			</Item>

			<Item onSelect={searchForLyrics} disabled={isAllDisabled}>
				{t("ctxMenus.searchForLyrics")}
			</Item>
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

	for (const id of getAllSelectedMedias())
		filePathsToShare.add(allMedias.get(id)!.path);

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
