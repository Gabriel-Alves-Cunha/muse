import { usePlaylists } from "@contexts/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByName;

export function MediasInfo() {
	const mainList = usePlaylists(mainListSelector);

	let allFilesSize = 0;

	mainList.forEach(({ size }) => allFilesSize += size);

	return <p>Size: {prettyBytes(allFilesSize)}</p>;
}
