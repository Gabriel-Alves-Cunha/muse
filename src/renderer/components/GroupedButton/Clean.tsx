import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { clearFavorites, clearHistory } from "@contexts/usePlaylists";
import { assertUnreachable } from "@utils/utils";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { playlistList } from "@common/enums";
import { fromList } from "../MediaListKind/helper";
import { TrashIcon } from "@icons/TrashIcon";

export const Clean: Component = () => {
	const [t] = useI18n();

	return (
		<ButtonOfGroup
			title={t("tooltips.cleanList")}
			onPointerUp={cleanProperList}
		>
			<TrashIcon class="w-4 h-4 stroke-white" />
		</ButtonOfGroup>
	);
};

/////////////////////////////////////////////
// Helper functions:

const cleanProperList = () => {
	const { fromList } = fromList();

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
};
