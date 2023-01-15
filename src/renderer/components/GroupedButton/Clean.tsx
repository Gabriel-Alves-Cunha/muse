import { FiTrash as CleanIcon } from "react-icons/fi";

import { clearFavorites, clearHistory } from "@contexts/usePlaylists";
import { useTranslation } from "@i18n";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { playlistList } from "@common/enums";
import { getFromList } from "../MediaListKind/states";

export function Clean() {
	const { t } = useTranslation();

	return (
		<ButtonOfGroup
			title={t("tooltips.cleanList")}
			onPointerUp={cleanProperList}
		>
			<CleanIcon size={17} className="stroke-white" />
		</ButtonOfGroup>
	);
}

/////////////////////////////////////////////
// Helper functions:

function cleanProperList() {
	const { fromList } = getFromList();

	if (fromList === playlistList.favorites) clearFavorites();
	else if (fromList === playlistList.history) clearHistory();
}
