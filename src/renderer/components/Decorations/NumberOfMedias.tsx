import { useSnapshot } from "valtio";

import { translation } from "@i18n";
import { playlists } from "@contexts/playlists";

export function NumberOfMedias() {
	const translationAccessor = useSnapshot(translation);
	const playlistsAccessor = useSnapshot(playlists);
	const t = translationAccessor.t;

	const numberOfMedias = playlistsAccessor.sortedByDate.size;
	const isPlural = numberOfMedias > 1;

	return (
		<p>
			{numberOfMedias} {t("decorations.media")}
			{isPlural ? "s" : ""}
		</p>
	);
}
