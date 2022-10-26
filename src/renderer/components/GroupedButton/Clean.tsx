import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { getFromList } from "@components/MediaListKind/helper";
import { t } from "@components/I18n";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/usePlaylists";

export const Clean = ({ className }: Props) => (
	<ButtonOfGroup
		title={t("tooltips.cleanList")}
		onPointerUp={cleanProperList}
		className={className}
	>
		<CleanIcon size={18} />
	</ButtonOfGroup>
);

/////////////////////////////////////////////
// Helper functions:

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
	}
}

/////////////////////////////////////////////
// Types:

type Props = Readonly<{ className?: string; }>;
