import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog, Trigger } from "@radix-ui/react-dialog";
import { Suspense, lazy } from "react";

import { searchAndOpenLyrics } from "../MediaPlayer/Lyrics";
import { setFilesToShare } from "@contexts/filesToShare";
import { useTranslation } from "@i18n";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { getSearcher } from "../SearchMedia/state";
import { openLyrics } from "../MediaPlayer/Header/LoadOrToggleLyrics";
import { RightSlot } from "./RightSlot";
import { Item } from "./Item";
import {
	setAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/useAllSelectedMedias";

const DeleteMediaDialogContent = lazy(() => import("../DeleteMediaDialog"));

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export default function SearchMediaOptionsCtxMenu({ isAllDisabled }: Props) {
	const { t } = useTranslation();

	return (
		<>
			<Dialog modal>
				<Trigger className="ctx-menu-item" disabled={isAllDisabled}>
					{t("ctxMenus.deleteMedia")}

					<RightSlot>
						<Trash />
					</RightSlot>
				</Trigger>

				<Suspense>
					<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
				</Suspense>
			</Dialog>

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

export const shareMedias = () => setFilesToShare(getAllSelectedMedias());

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
