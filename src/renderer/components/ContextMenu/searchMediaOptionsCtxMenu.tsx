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
				<Trigger
					className="group unset-all relative flex items-center w-[calc(100%-35px)] h-6 cursor-pointer border-none py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide leading-none select-none ctx-trigger"
					disabled={isAllDisabled}
				>
					<>
						{t("ctxMenus.deleteMedia")}

						<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
							<Trash />
						</div>
					</>
				</Trigger>

				<Suspense>
					<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
				</Suspense>
			</Dialog>

			<Item onSelect={shareMedias} disabled={isAllDisabled}>
				{t("ctxMenus.shareMedia")}

				<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					<Share />
				</div>
			</Item>

			<Item onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
				{t("ctxMenus.selectAllMedias")}

				<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					Ctrl+A
				</div>
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
