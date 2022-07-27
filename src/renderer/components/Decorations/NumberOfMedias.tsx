import { usePlaylists } from "@contexts/mediaHandler/usePlaylists";

const size = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByDate.size;

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists(size);

	return <p>{numberOfMedias} medias</p>;
}
