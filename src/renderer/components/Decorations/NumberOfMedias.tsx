import { type Playlists, usePlaylists } from "@contexts/playlists";
import { selectT, useTranslator } from "@i18n";

const selectSortedByDateSize = (state: Playlists): number =>
	state.sortedByTitleAndMainList.size;

export function NumberOfMedias(): JSX.Element {
	const numberOfMedias = usePlaylists(selectSortedByDateSize);
	const t = useTranslator(selectT);

	const isPlural = numberOfMedias > 1 || numberOfMedias === 0;

	return (
		<p>
			{numberOfMedias} {t("decorations.media")}
			{isPlural ? "s" : ""}
		</p>
	);
}
