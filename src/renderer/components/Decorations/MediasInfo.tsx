import { type Playlists, usePlaylists } from "@contexts/playlists";
import { selectT, useTranslator } from "@i18n";
import { prettyBytes } from "@common/prettyBytes";

const selectMainList = (
	state: Playlists,
): Playlists["sortedByTitleAndMainList"] => state.sortedByTitleAndMainList;

export function MediasInfo(): JSX.Element {
	const mainList = usePlaylists(selectMainList);
	const t = useTranslator(selectT);

	let allFilesSize = 0;

	for (const [, { size }] of mainList) allFilesSize += size;

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
}
