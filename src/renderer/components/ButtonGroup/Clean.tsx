import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { getFromList } from "@components/MediaListKind/helper";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/mediaHandler/usePlaylists";

import { Button } from "./styles";

export const Clean = ({ className }: Props) => (
	<Button onClick={cleanProperList} className={className} data-tip="Clean List">
		<CleanIcon size={18} />
	</Button>
);

function cleanProperList() {
	const { fromList } = getFromList();

	switch (fromList) {
		case PlaylistList.FAVORITES:
			cleanFavorites();
			break;

		case PlaylistList.HISTORY:
			cleanHistory();
			break;

		default:
			assertUnreachable(fromList);
			break;
	}
}

type Props = { className?: string; };
