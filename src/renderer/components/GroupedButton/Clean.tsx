import { FiTrash as CleanIcon } from "react-icons/fi";
import { useSnapshot } from "valtio";

import { PlaylistListEnum } from "@common/enums";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { translation } from "@i18n";
import { playlists } from "@contexts/playlists";
import { fromList } from "../MediaListKind/states";

export function Clean() {
	const t = useSnapshot(translation).t;

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
	if (fromList.curr === PlaylistListEnum.favorites) playlists.favorites.clear();
	else if (fromList.curr === PlaylistListEnum.history)
		playlists.history.clear();
}
