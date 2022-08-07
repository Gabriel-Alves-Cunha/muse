import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/helpers";
import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import { mainList } from "@contexts/usePlaylists";
import {
	setAllSelectedMedias,
	allSelectedMedias,
} from "@contexts/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";
import { getSearcher } from "@components/SearchMedia/helper";

export function SearchMediaOptionsCtxMenu({ isAllDisabled }: Props) {
	const plural = allSelectedMedias().size > 1 ? "s" : "";

	return (
		<>
			<Dialog modal>
				<TriggerToDeleteMedia disabled={isAllDisabled}>
					<>
						Delete media{plural}

						<RightSlot>
							<Trash />
						</RightSlot>
					</>
				</TriggerToDeleteMedia>

				<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
			</Dialog>

			<Item onSelect={shareMedias} disabled={isAllDisabled}>
				Share media{plural}
				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
				Select all medias
				<RightSlot>Ctrl+A</RightSlot>
			</Item>

			<Item onSelect={searchForLyrics} disabled={isAllDisabled}>
				Search for lyrics
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

		await searchAndOpenLyrics(media, path, false);
	});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ isAllDisabled: boolean; }>;
