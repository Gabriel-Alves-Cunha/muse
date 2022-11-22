import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Trigger } from "@radix-ui/react-context-menu";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { shareMedias } from "./searchMediaOptionsCtxMenu";
import { getMainList } from "@contexts/usePlaylists";
import { openLyrics } from "@components/MediaPlayer/Header";
import { deleteFile } from "@utils/deleteFile";
import { Translator } from "@components/I18n";
import { Item } from "./Item";
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
					aria-disabled={isDisabled}
					className="group unset-all relative flex items-center w-[calc(100%-35px)] h-6 cursor-pointer border-none py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide leading-none select-none ctx-trigger"
				>
					<>
						<Translator path="ctxMenus.deleteMedia" />

						<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
							<Trash />
						</div>
					</>
				</Trigger>

				<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
			</Dialog>

			<Item onSelect={shareMedias} disabled={isDisabled}>
				<Translator path="ctxMenus.shareMedia" />

				<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					<Share />
				</div>
			</Item>

			<Item onSelect={selectAllMedias}>
				<Translator path="ctxMenus.selectAllMedias" />

				<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					Ctrl+A
				</div>
			</Item>

			<Item onSelect={searchForLyrics} disabled={isDisabled}>
				<Translator path="ctxMenus.searchForLyrics" />
			</Item>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export async function deleteMedias(): Promise<void> {
	const promises = Array.from(getAllSelectedMedias(), (path) =>
		deleteFile(path),
	);

	await Promise.all(promises);
}

/////////////////////////////////////////////

export async function searchForLyrics(): Promise<void> {
	const allMedias = getMainList();

	for (const path of getAllSelectedMedias()) {
		const media = allMedias.get(path);

		await searchAndOpenLyrics(media, path, !openLyrics);
	}
}
