import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Suspense, lazy } from "react";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { useTranslation } from "@i18n";
import { deleteFile } from "@utils/deleteFile";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";
import {
	useAllSelectedMedias,
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

const sizeSelector = (
	state: ReturnType<typeof useAllSelectedMedias.getState>,
) => state.medias.size;

export default function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const size = useAllSelectedMedias(sizeSelector);
	const { t } = useTranslation();

	const isDisabled = size === 0;

	return (
		<>
			<>
				<CenteredModalTrigger
					htmlTargetName={deleteMediaModalID_mediaOptionsCtxMenu}
					labelProps={{ "aria-disabled": isDisabled }}
					labelClassName="menu-item"
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
