import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/helpers";
import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import { mainList } from "@contexts/mediaHandler/usePlaylists";
import {
	allSelectedMedias,
	selectAllMedias,
} from "@contexts/mediaHandler/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";

export function MediaOptionsCtxMenu() {
	const plural = allSelectedMedias().length > 1 ? "s" : "";

	return (
		<>
			<>
				<Dialog modal>
					<TriggerToDeleteMedia>
						Delete media{plural}

						<RightSlot>
							<Trash />
						</RightSlot>
					</TriggerToDeleteMedia>

					<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
				</Dialog>
			</>

			<Item onClick={shareMedias}>
				Share media{plural}
				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onClick={selectAllMedias}>
				Select all medias
				<RightSlot>Ctrl+A</RightSlot>
			</Item>

			<Item onClick={searchForLyrics}>Search for lyrics</Item>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export function shareMedias() {
	setSettings({ filesToShare: new Set(allSelectedMedias()) });
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

	allSelectedMedias().forEach(async selectedMediaPath => {
		const media = allMedias.get(selectedMediaPath);

		await searchAndOpenLyrics(media, selectedMediaPath, false);
	});
}
