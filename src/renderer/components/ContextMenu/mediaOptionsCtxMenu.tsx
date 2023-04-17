import { useCallback, useState } from "react";
import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { selectT, useTranslator } from "@i18n";
import { CenteredModal } from "../CenteredModal";
import { deleteFile } from "@utils/deleteFile";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";
import {
	clearAllSelectedMedias,
	allSelectedMediasRef,
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/allSelectedMedias";

export function MediaOptionsCtxMenu(): JSX.Element {
	const allSelectedMedias = allSelectedMediasRef().current;
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslator(selectT);

	// If there is none selected, disable:
	const isDisabled = allSelectedMedias.size === 0;

	const closeMediaOptionsCtxMenu = useCallback(() => setIsOpen(false), []);
	const openMediaOptionsCtxMenu = useCallback(() => setIsOpen(true), []);

	return (
		<>
			<>
				<button
					onPointerUp={openMediaOptionsCtxMenu}
					disabled={isDisabled}
					data-menu-item
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

			<MenuItem onPointerUp={shareMedias} disabled={isDisabled}>
				{t("ctxMenus.shareMedia")}

				<RightSlot>
					<Share />
				</RightSlot>
			</MenuItem>

			<MenuItem onPointerUp={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
			</MenuItem>

			<MenuItem onPointerUp={searchForLyrics} disabled={isDisabled}>
				{t("ctxMenus.searchForLyrics")}

				<RightSlot>&emsp;&emsp;</RightSlot>
			</MenuItem>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export function deleteMedias(): void {
	const promises: Promise<void>[] = [];

	for (const path of getAllSelectedMedias()) promises.push(deleteFile(path));

	clearAllSelectedMedias();

	Promise.allSettled(promises);
}
