import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Suspense, lazy } from "react";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { useTranslation } from "@i18n";
import { deleteFile } from "@utils/deleteFile";
import { RightSlot } from "./RightSlot";
import { Item } from "./Item";
import {
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";
import {
	CenteredModalContent,
	CenteredModalTrigger,
} from "@components/CenteredModal";

const DeleteMediaDialogContent = lazy(() => import("../DeleteMediaDialog"));

const deleteMediaModalID_mediaOptionsCtxMenu =
	"delete-media-modal-media-options-ctx-menu";

export default function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const isDisabled = getAllSelectedMedias().size === 0;
	const { t } = useTranslation();

	return (
		<>
			<>
				<CenteredModalTrigger
					inputProps={{ disabled: isDisabled }}
					htmlTargetName={deleteMediaModalID_mediaOptionsCtxMenu}
					labelClassName="ctx-menu-item"
				>
					{t("ctxMenus.deleteMedia")}

					<RightSlot>
						<Trash />
					</RightSlot>
				</CenteredModalTrigger>

				<CenteredModalContent htmlFor={deleteMediaModalID_mediaOptionsCtxMenu}>
					<Suspense>
						<DeleteMediaDialogContent
							idOfModalToBeClosed={deleteMediaModalID_mediaOptionsCtxMenu}
							handleMediaDeletion={deleteMedias}
						/>
					</Suspense>
				</CenteredModalContent>
			</>

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
