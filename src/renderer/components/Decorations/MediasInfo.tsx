import { useSnapshot } from "valtio";

import { prettyBytes } from "@common/prettyBytes";
import { translation } from "@i18n";
import { playlists } from "@contexts/playlists";

export function MediasInfo() {
	const translationAccessor = useSnapshot(translation);
	const playlistsAccessor = useSnapshot(playlists);
	const t = translationAccessor.t;

	let allFilesSize = 0;

	for (const [, { size }] of playlistsAccessor.sortedByTitleAndMainList)
		allFilesSize += size;

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
}
