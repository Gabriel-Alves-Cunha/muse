import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { getFromList } from "@components/MediaListKind/helper";
import { t } from "@components/I18n";
import {
	cleanFavorites,
	cleanHistory,
	PlaylistList,
} from "@contexts/usePlaylists";

import { ButtonFromGroup } from "./styles";

export const Clean = ({ className }: Props) => (
	<ButtonFromGroup
		data-tip={t("tooltips.cleanList")}
		onClick={cleanProperList}
		className={className}
		data-place="bottom"
	>
		<CleanIcon size={18} />
	</ButtonFromGroup>
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
