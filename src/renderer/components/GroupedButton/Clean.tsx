import { FiTrash as CleanIcon } from "react-icons/fi";

import { EMPTY_ARRAY, EMPTY_SET } from "@utils/empty";
import { selectT, useTranslator } from "@i18n";
import { getListTypeToDisplay } from "../MediaListKind/states";
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
	if (getListTypeToDisplay().current === PlaylistListEnum.favorites) {
		setPlaylists({ favorites: EMPTY_SET });

		return;
	}

	if (getListTypeToDisplay().current === PlaylistListEnum.history) {
		setPlaylists({ history: EMPTY_ARRAY });

		return;
	}
}
