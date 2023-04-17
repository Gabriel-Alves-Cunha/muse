import { FiTrash as CleanIcon } from "react-icons/fi";

import { selectT, useTranslator } from "@i18n";
import { getListTypeToDisplay } from "../MediaListKind/states";
import { emptyMap, emptySet } from "@utils/empty";
import { PlaylistListEnum } from "@common/enums";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { setPlaylists } from "@contexts/playlists";

export function Clean(): JSX.Element {
	const t = useTranslator(selectT);

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

function cleanProperList(): void {
	if (getListTypeToDisplay() === PlaylistListEnum.favorites) {
		setPlaylists({ favorites: emptySet });

		return;
	}

	if (getListTypeToDisplay() === PlaylistListEnum.history) {
		setPlaylists({ history: emptyMap });

		return;
	}
}
