import { FiTrash as Trash } from "react-icons/fi";

import { allSelectedMedias } from "@components/MediaListKind/helper";
import { deleteMedia } from "@contexts/mediaHandler/usePlaylists";

import { RightSlot, Item } from "./styles";

export function MediaOptionsCtxMenu() {
	const isPlural = allSelectedMedias.size > 1;

	return (
		<>
			<Item onClick={deleteMedias}>
				Delete media{isPlural ? "s" : ""}
				<RightSlot className="notransition">
					<Trash />
				</RightSlot>
			</Item>
		</>
	);
}

async function deleteMedias(): Promise<void> {
	const promises: Promise<void>[] = [];

	allSelectedMedias.forEach(path => promises.push(deleteMedia(path)));

	await Promise.all(promises);
}
