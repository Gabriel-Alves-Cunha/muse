import { type Component, Show } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { getAllSelectedMedias } from "@contexts/useAllSelectedMedias";

export const NumberOfMediasSelected: Component = () => {
	const numberOfMediasSelected = getAllSelectedMedias().size;
	const [t] = useI18n();

	return (
		<Show when={numberOfMediasSelected}>
			<p>
				{numberOfMediasSelected} {t("decorations.selected")}
			</p>
		</Show>
	);
};
