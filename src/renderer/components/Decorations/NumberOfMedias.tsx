import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { playlists } from "@contexts/usePlaylists";

export const NumberOfMedias: Component = () => {
	const numberOfMedias = playlists().sortedByDate.size;
	const [t] = useI18n();

	return (
		<p>
			{numberOfMedias} {t("decorations.medias")}
		</p>
	);
};
