import { usePlaylists } from "@contexts/mediaHandler/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";

const getMainList = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByName;

export function MediasInfo() {
	const mainList = usePlaylists(getMainList);

	let allFilesSize = 0;

	mainList.forEach(({ size }) => allFilesSize += size);

	return <p>Size: {prettyBytes(allFilesSize)}</p>;
}
