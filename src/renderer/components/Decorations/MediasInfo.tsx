import { usePlaylists } from "@contexts/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";
import { t } from "@components/I18n";

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByName;

export function MediasInfo() {
	const mainList = usePlaylists(mainListSelector);

	let allFilesSize = 0;

	for (const [_, { size }] of mainList) allFilesSize += size;

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
}
