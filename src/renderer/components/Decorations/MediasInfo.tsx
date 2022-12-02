import { usePlaylists } from "@contexts/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";
import { useI18n } from "@solid-primitives/i18n";

export function MediasInfo() {
	const mainList = usePlaylists((state) => state.sortedByNameAndMainList);
	const [t] = useI18n();

	let allFilesSize = 0;

	for (const [, { size }] of mainList) allFilesSize += size;

	return (
		<p>
			{t("decorations.size")}: {prettyBytes(allFilesSize)}
		</p>
	);
}
