import { useSnapshot } from "valtio";

import { translation } from "@i18n";
import { playlists } from "@contexts/playlists";

export function NumberOfMedias() {
	const playlistsAccessor = useSnapshot(playlists);
	const t = useSnapshot(translation).t;

	const numberOfMedias = playlistsAccessor.sortedByDate.size;
	const isPlural = numberOfMedias > 1;

	return (
		<p>
			{numberOfMedias} {t("decorations.media")}
			{isPlural ? "s" : ""}
		</p>
	);
}
