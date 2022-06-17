import { FiTrash as Trash } from "react-icons/fi";

import { deleteMedia } from "@contexts/mediaHandler/usePlaylists";
import { emptySet } from "@utils/map-set";
import {
	getAllSelectedMedias,
	setAllSelectedMedias,
	useAllSelectedMedias,
} from "@components/MediaListKind/helper";

import { RightSlot, Item } from "./styles";

export function MediaOptionsCtxMenu() {
	const { allSelectedMedias } = useAllSelectedMedias();
	const isPlural = allSelectedMedias.size > 1;

	return (
		<>
			<Item onClick={deleteMedias} className="notransition">
				Delete media{isPlural ? "s" : ""}
				<RightSlot>
					<Trash />
				</RightSlot>
			</Item>
		</>
	);
}

async function deleteMedias(): Promise<void> {
	const { allSelectedMedias } = getAllSelectedMedias();

	const promises: Promise<void>[] = [];

	allSelectedMedias.forEach(path => promises.push(deleteMedia(path)));
	setAllSelectedMedias({ allSelectedMedias: emptySet });

	await Promise.all(promises);
}
