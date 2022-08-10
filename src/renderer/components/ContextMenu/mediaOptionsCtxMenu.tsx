import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import { openLyrics } from "@components/MediaPlayer/Header";
import { Translator } from "@components/I18n";
import { mainList } from "@contexts/usePlaylists";
import {
	allSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";

export function MediaOptionsCtxMenu() {
	const plural = allSelectedMedias().size > 1 ? "s" : "";
	// If there is none selected, disable:
	const isDisabled = allSelectedMedias().size === 0;

	return (
		<>
			<Dialog modal>
				<TriggerToDeleteMedia disabled={isDisabled}>
					<>
						<Translator path="ctxMenus.deleteMedia" />
						{plural}

						<RightSlot>
							<Trash />
						</RightSlot>
					</>
				</TriggerToDeleteMedia>

				<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
			</Dialog>

			<Item onSelect={shareMedias} disabled={isDisabled}>
				<Translator path="ctxMenus.shareMedia" />
				{plural}

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

export function shareMedias() {
	setSettings({ filesToShare: allSelectedMedias() });
}

/////////////////////////////////////////////

async function deleteMedias(): Promise<void> {
	const promises: Promise<void>[] = [];

	allSelectedMedias().forEach(path => promises.push(deleteMedia(path)));

	await Promise.all(promises);
}

/////////////////////////////////////////////

function searchForLyrics(): void {
	const allMedias = mainList();

	allSelectedMedias().forEach(async path => {
		const media = allMedias.get(path);

		await searchAndOpenLyrics(media, path, !openLyrics);
	});
}
