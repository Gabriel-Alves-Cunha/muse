import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";

import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import {
	allSelectedMedias,
	selectAllMedias,
} from "@contexts/mediaHandler/usePlaylists";

import { RightSlot, Item } from "./styles";

export function MediaOptionsCtxMenu() {
	const plural = allSelectedMedias.length > 1 ? "s" : "";

	return (
		<>
			<Item onClick={deleteMedias} className="notransition">
				Delete media{plural}
				<RightSlot>
					<Trash />
				</RightSlot>
			</Item>

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

function shareMedias() {
	setSettings({ filesToShare: new Set(allSelectedMedias) });
}

async function deleteMedias(): Promise<void> {
	const promises: Promise<void>[] = [];

	allSelectedMedias.forEach(path => promises.push(deleteMedia(path)));

	await Promise.all(promises);
}
