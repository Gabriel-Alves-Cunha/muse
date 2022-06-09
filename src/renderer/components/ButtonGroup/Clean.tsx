import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { TooltipButton } from "@components/TooltipButton";
import { getFromList } from "@components/MediaListKind/helper";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/mediaHandler/usePlaylists";

export const Clean = ({ className }: Props) => (
	<TooltipButton
		onClick={cleanProperList}
		className={className}
		tooltip="Clean list"
		type="button"
	>
		<CleanIcon size={18} />
	</TooltipButton>
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
