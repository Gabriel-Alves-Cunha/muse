import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { TooltipButton } from "@components/TooltipButton";
import { getFromList } from "@components/MediaListKind/helper";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/mediaHandler/usePlaylists";

export function Clean({ className }: Props) {
	return (
		<TooltipButton
			onClick={handleOnClick}
			className={className}
			tooltip="Clean list"
			type="button"
		>
			<CleanIcon size={17} />
		</TooltipButton>
	);
}

const handleOnClick = () => {
	const { fromList } = getFromList();

	switch (fromList) {
		case PlaylistList.FAVORITES:
			cleanFavorites();
			break;

		case PlaylistList.HISTORY:
			cleanHistory();
			break;

		case PlaylistList.MAIN_LIST:
			break;

		case PlaylistList.SORTED_BY_DATE:
			break;

		default:
			assertUnreachable(fromList);
			break;
	}
};

type Props = {
	className?: string;
};
