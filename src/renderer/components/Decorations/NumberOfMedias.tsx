import { usePlaylists } from "@contexts/mediaHandler/usePlaylists";

const sizeSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByDate.size;

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists(sizeSelector);

	return <p>{numberOfMedias} medias</p>;
}
