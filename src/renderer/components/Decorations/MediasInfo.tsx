import { useTranslation } from "@i18n";
import { usePlaylists } from "@contexts/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByNameAndMainList;

export function MediasInfo() {
	const mainList = usePlaylists(mainListSelector);
	const { t } = useTranslation();

	let allFilesSize = 0;

	for (const [, { size }] of mainList) allFilesSize += size;

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
}
