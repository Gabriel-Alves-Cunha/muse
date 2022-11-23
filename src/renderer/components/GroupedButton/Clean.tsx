import { FiTrash as CleanIcon } from "react-icons/fi";

import { assertUnreachable } from "@utils/utils";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { playlistList } from "@common/enums";
import { getFromList } from "@components/MediaListKind/helper";
import { t } from "@components/I18n";
import { clearFavorites, clearHistory } from "@contexts/usePlaylists";

export const Clean = () => (
	<ButtonOfGroup title={t("tooltips.cleanList")} onPointerUp={cleanProperList}>
		<CleanIcon size={17} className="stroke-white" />
	</ButtonOfGroup>
);

/////////////////////////////////////////////
// Helper functions:

function cleanProperList() {
	const { fromList } = getFromList();

	switch (fromList) {
		case playlistList.favorites: {
			clearFavorites();
			break;
		}

		case playlistList.history: {
			clearHistory();
			break;
		}

		default:
			assertUnreachable(fromList);
	}
}
