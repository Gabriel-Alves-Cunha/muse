import { useSnapshot } from "valtio";

import { prettyBytes } from "@common/prettyBytes";
import { translation } from "@i18n";
import { playlists } from "@contexts/playlists";

export function MediasInfo() {
	const playlistsAccessor = useSnapshot(playlists);
	const t = useSnapshot(translation).t;

	let allFilesSize = 0;

	for (const [, { size }] of playlistsAccessor.sortedByTitleAndMainList)
		allFilesSize += size;

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
}
