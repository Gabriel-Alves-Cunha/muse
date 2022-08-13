import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { shareMedias } from "./searchMediaOptionsCtxMenu";
import { deleteMedia } from "@utils/media";
import { openLyrics } from "@components/MediaPlayer/Header";
import { Translator } from "@components/I18n";
import { getMainList } from "@contexts/usePlaylists";
import {
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";

export function MediaOptionsCtxMenu() {
	// If there is none selected, disable:
	const isDisabled = getAllSelectedMedias().size === 0;

	return (
		<>
			<Dialog modal>
				<TriggerToDeleteMedia disabled={isDisabled}>
					<>
						<Translator path="ctxMenus.deleteMedia" />

						<RightSlot>
							<Trash />
						</RightSlot>
					</>
				</TriggerToDeleteMedia>

				<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
			</Dialog>

			<Item onSelect={shareMedias} disabled={isDisabled}>
				<Translator path="ctxMenus.shareMedia" />

				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onSelect={selectAllMedias}>
				<Translator path="ctxMenus.selectAllMedias" />

				<RightSlot>Ctrl+A</RightSlot>
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
	const promises = Array.from(
		getAllSelectedMedias(),
		path => deleteMedia(path),
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
