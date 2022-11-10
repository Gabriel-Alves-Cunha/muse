import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Trigger } from "@radix-ui/react-context-menu";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { CtxMenuItemRightSlot } from "./CtxMenuItemRightSlot";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { shareMedias } from "./searchMediaOptionsCtxMenu";
import { getMainList } from "@contexts/usePlaylists";
import { openLyrics } from "@components/MediaPlayer/Header";
import { deleteFile } from "@utils/deleteFile";
import { Translator } from "@components/I18n";
import { CtxMenuItem } from "./CtxMenuItem";
import {
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

export function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const isDisabled = getAllSelectedMedias().size === 0;

	return (
		<>
			<Dialog modal>
				<Trigger
					className="group ctx-menu-trigger"
					aria-disabled={isDisabled}
				>
					<>
						<Translator path="ctxMenus.deleteMedia" />

						<CtxMenuItemRightSlot>
							<Trash />
						</CtxMenuItemRightSlot>
					</>
				</Trigger>

				<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
			</Dialog>

			<CtxMenuItem onSelect={shareMedias} disabled={isDisabled}>
				<Translator path="ctxMenus.shareMedia" />

				<CtxMenuItemRightSlot>
					<Share />
				</CtxMenuItemRightSlot>
			</CtxMenuItem>

			<CtxMenuItem onSelect={selectAllMedias}>
				<Translator path="ctxMenus.selectAllMedias" />

				<CtxMenuItemRightSlot>
					Ctrl+A
				</CtxMenuItemRightSlot>
			</CtxMenuItem>

			<CtxMenuItem onSelect={searchForLyrics} disabled={isDisabled}>
				<Translator path="ctxMenus.searchForLyrics" />
			</CtxMenuItem>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export async function deleteMedias(): Promise<void> {
	const promises = Array.from(
		getAllSelectedMedias(),
		path => deleteFile(path),
	);

	await Promise.all(promises);
}

/////////////////////////////////////////////

function searchForLyrics(): void {
	const allMedias = getMainList();

	getAllSelectedMedias().forEach(async path => {
		const media = allMedias.get(path);

		await searchAndOpenLyrics(media, path, !openLyrics);
	});
}
