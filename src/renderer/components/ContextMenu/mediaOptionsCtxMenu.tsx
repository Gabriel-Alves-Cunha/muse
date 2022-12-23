import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Suspense, lazy } from "react";
import { Trigger } from "@radix-ui/react-context-menu";
import { Dialog } from "@radix-ui/react-dialog";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { useTranslation } from "@i18n";
import { deleteFile } from "@utils/deleteFile";
import { RightSlot } from "./RightSlot";
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
			<div>
				<Dialog modal>
					<Trigger className="ctx-menu-item" disabled={isDisabled}>
						{t("ctxMenus.deleteMedia")}

						<RightSlot>
							<Trash />
						</RightSlot>
					</Trigger>

					<Suspense>
						<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
					</Suspense>
				</Dialog>
			</div>

			<Item onSelect={shareMedias} disabled={isDisabled}>
				{t("ctxMenus.shareMedia")}

				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onSelect={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
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

export function deleteMedias(): void {
	const promises = Array.from(getAllSelectedMedias(), (path) =>
		deleteFile(path),
	);

	Promise.all(promises).then();
}
