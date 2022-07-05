import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { getFromList } from "@components/MediaListKind/helper";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/mediaHandler/usePlaylists";

import { ButtonFromGroup } from "./styles";

export const Clean = ({ className }: Props) => (
	<ButtonFromGroup
		onClick={cleanProperList}
		className={className}
		data-tip="Clean list"
		data-place="bottom"
	>
		<CleanIcon size={18} />
	</ButtonFromGroup>
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

type Props = Readonly<{ className?: string; }>;
