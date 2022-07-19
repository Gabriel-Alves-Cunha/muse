import { usePlaylists } from "@contexts/mediaHandler/usePlaylists";
import { prettyBytes } from "@common/prettyBytes";

import { FileSize } from "./styles";

export function MediasInfo() {
	const mainList = usePlaylists().sortedByName;

	let allFilesSize = 0;

	mainList.forEach(({ size }) => allFilesSize += size);

	return (
		<>
			<FileSize>Size: {prettyBytes(allFilesSize)}</FileSize>
		</>
	);
}
