import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { useSnapshot } from "valtio";
import { useState } from "react";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { CenteredModal } from "../CenteredModal";
import { translation } from "@i18n";
import { deleteFile } from "@utils/deleteFile";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";
import {
	allSelectedMedias,
	selectAllMedias,
} from "@contexts/allSelectedMedias";

export default function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const allSelectedMediasAccessor = useSnapshot(allSelectedMedias);
	const [isOpen, setIsOpen] = useState(false);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	const isDisabled = allSelectedMediasAccessor.size === 0;

	return (
		<>
			<>
				<button
					onPointerUp={() => setIsOpen(true)}
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
						closeDialog={() => setIsOpen(false)}
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

	for (const path of allSelectedMedias) promises.push(deleteFile(path));

	Promise.all(promises).then();
}
