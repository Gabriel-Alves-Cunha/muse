import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { useState } from "react";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { useTranslation } from "@i18n";
import { CenteredModal } from "../CenteredModal";
import { deleteFile } from "@utils/deleteFile";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";
import {
	useAllSelectedMedias,
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

const sizeSelector = (
	state: ReturnType<typeof useAllSelectedMedias.getState>,
) => state.medias.size;

export default function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const size = useAllSelectedMedias(sizeSelector);
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	const isDisabled = size === 0;

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
					<DeleteMediaDialogContent handleDeleteMedia={deleteMedias} />
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
	const promises = Array.from(getAllSelectedMedias(), (path) =>
		deleteFile(path),
	);

	Promise.all(promises).then();
}
