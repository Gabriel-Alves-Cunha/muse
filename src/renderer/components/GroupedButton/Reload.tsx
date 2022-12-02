import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { ButtonOfGroup } from "./ButtonOfGroup";
import { ReloadIcon } from "@icons/ReloadIcon";
import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/usePlaylists";

export const Reload: Component = () => {
	const isLoadingMedias = usePlaylists((state) => state.isLoadingMedias);
	const [t] = useI18n();

	return (
		<ButtonOfGroup
			classList={{ "animate-spin": isLoadingMedias }}
			onPointerUp={searchLocalComputerForMedias}
			title={t("tooltips.reloadAllMedias")}
		>
			<ReloadIcon class="w-4 h-4 fill-white" />
		</ButtonOfGroup>
	);
};
