import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { getFromList } from "@components/MediaListKind/helper";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/mediaHandler/usePlaylists";

import { Button } from "./styles";

export function Clean({ className }: Props) {
	return (
		<Button
			data-tooltip="Clean list"
			onClick={handleOnClick}
			className={className}
		>
			<CleanIcon size={17} />
		</Button>
	);
}

const handleOnClick = () => {
	const list = getFromList().fromList;

	switch (list) {
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

		case PlaylistList.SORTED_BY_NAME:
			break;

		default:
			assertUnreachable(list);
			break;
	}
};

type Props = {
	className?: string;
};
