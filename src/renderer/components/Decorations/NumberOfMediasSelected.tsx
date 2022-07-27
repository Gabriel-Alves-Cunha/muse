import { useAllSelectedMedias } from "@contexts/mediaHandler/useAllSelectedMedias";

const length = (state: ReturnType<typeof useAllSelectedMedias.getState>) =>
	state.medias.length;

export function NumberOfMediasSelected() {
	const numberOfMediasSelected = useAllSelectedMedias(length);

	return (
		<p>
			{numberOfMediasSelected === 0 ? "" : `${numberOfMediasSelected} selected`}
		</p>
	);
}
