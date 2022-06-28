import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";

import { deleteMedia } from "@utils/media";
import { setSettings } from "@contexts/settings";
import { emptySet } from "@utils/map-set";
import {
	getAllSelectedMedias,
	setAllSelectedMedias,
	useAllSelectedMedias,
} from "@components/MediaListKind/helper";

import { RightSlot, Item } from "./styles";

export function MediaOptionsCtxMenu() {
	const { allSelectedMedias } = useAllSelectedMedias();
	const plural = allSelectedMedias.size > 1 ? "s" : "";

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
		</>
	);
}

function shareMedias() {
	const { allSelectedMedias } = getAllSelectedMedias();

	setSettings({ filesToShare: allSelectedMedias });
}

async function deleteMedias(): Promise<void> {
	const { allSelectedMedias } = getAllSelectedMedias();

	const promises: Promise<void>[] = [];

	allSelectedMedias.forEach(path => promises.push(deleteMedia(path)));

	setAllSelectedMedias({ allSelectedMedias: emptySet });

	await Promise.all(promises);
}
