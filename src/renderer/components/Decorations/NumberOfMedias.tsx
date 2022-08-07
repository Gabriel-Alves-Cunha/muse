import { usePlaylists } from "@contexts/usePlaylists";

const sizeSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByDate.size;

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists(sizeSelector);

	return <p>{numberOfMedias} medias</p>;
}
