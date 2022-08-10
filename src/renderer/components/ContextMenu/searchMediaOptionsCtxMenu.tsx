import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import { getSearcher } from "@components/SearchMedia/helper";
import { openLyrics } from "@components/MediaPlayer/Header";
import { Translator } from "@components/I18n";
import { mainList } from "@contexts/usePlaylists";
import {
	setAllSelectedMedias,
	allSelectedMedias,
} from "@contexts/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function SearchMediaOptionsCtxMenu({ isAllDisabled }: Props) {
	const plural = allSelectedMedias().size > 1 ? "s" : "";

	return (
		<>
			<Dialog modal>
				<TriggerToDeleteMedia disabled={isAllDisabled}>
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

			<Item onSelect={shareMedias} disabled={isAllDisabled}>
				<Translator path="ctxMenus.shareMedia" />
				{plural}

				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
				<Translator path="ctxMenus.selectAllMedias" />

				<RightSlot>Ctrl+A</RightSlot>
			</Item>

			<Item onSelect={searchForLyrics} disabled={isAllDisabled}>
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

function selectAllMediasOnSearchResult(): void {
	const arr = getSearcher().results.map(([path]) => path);
	setAllSelectedMedias(new Set(arr));
}

/////////////////////////////////////////////

function searchForLyrics(): void {
	const allMedias = mainList();

	allSelectedMedias().forEach(async path => {
		const media = allMedias.get(path);

		await searchAndOpenLyrics(media, path, !openLyrics);
	});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ isAllDisabled: boolean; }>;
