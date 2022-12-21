import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Suspense, lazy } from "react";
import { Trigger } from "@radix-ui/react-context-menu";
import { Dialog } from "@radix-ui/react-dialog";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { useTranslation } from "@i18n";
import { deleteFile } from "@utils/deleteFile";
import { Item } from "./Item";
import {
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

const DeleteMediaDialogContent = lazy(() => import("../DeleteMediaDialog"));

export default function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const isDisabled = getAllSelectedMedias().size === 0;
	const { t } = useTranslation();

	return (
		<>
			<Dialog modal>
				<Trigger
					aria-disabled={isDisabled}
					className="group unset-all relative flex items-center w-[calc(100%-35px)] h-6 cursor-pointer border-none py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide leading-none select-none ctx-trigger"
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

			<Item onSelect={shareMedias} disabled={isDisabled}>
				{t("ctxMenus.shareMedia")}

				<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					<Share />
				</div>
			</Item>

			<Item onSelect={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					Ctrl+A
				</div>
			</Item>

			<Item onSelect={searchForLyrics} disabled={isDisabled}>
				{t("ctxMenus.searchForLyrics")}
			</Item>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export const deleteMedias = (): void => {
	const promises = Array.from(getAllSelectedMedias(), (path) =>
		deleteFile(path),
	);

	Promise.all(promises).then();
};
