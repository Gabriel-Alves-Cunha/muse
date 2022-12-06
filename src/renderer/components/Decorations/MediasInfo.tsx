import { type Component, createEffect } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { playlists } from "@contexts/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";

export const MediasInfo: Component = () => {
	const [t] = useI18n();
	let allFilesSize = 0;

	createEffect(() => {
		const mainList = playlists().sortedByNameAndMainList;

		allFilesSize = 0;

		for (const [, { size }] of mainList) allFilesSize += size;
	});

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
};
