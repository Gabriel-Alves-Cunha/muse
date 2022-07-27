import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import {
	allSelectedMedias,
	selectAllMedias,
} from "@contexts/mediaHandler/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";
import {
	StyledDialogBlurOverlay,
} from "@components/MediaListKind/MediaOptions/styles";

export function MediaOptionsCtxMenu() {
	const plural = allSelectedMedias().length > 1 ? "s" : "";

	return (
		<>
			<>
				<Dialog modal>
					<TriggerToDeleteMedia className="notransition">
						Delete media{plural}

						<RightSlot>
							<Trash />
						</RightSlot>
					</TriggerToDeleteMedia>

					<StyledDialogBlurOverlay />

					<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
				</Dialog>
			</>

			<Item onClick={shareMedias} className="notransition">
				Share media{plural}
				<RightSlot>
					<Share />
				</RightSlot>
			</Item>

			<Item onClick={selectAllMedias} className="notransition">
				Select all medias
				<RightSlot>Ctrl+A</RightSlot>
			</Item>
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
