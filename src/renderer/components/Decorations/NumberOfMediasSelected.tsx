import { useAllSelectedMedias } from "@contexts/useAllSelectedMedias";

const sizeSelector = (
	state: ReturnType<typeof useAllSelectedMedias.getState>,
) => state.medias.size;

export function NumberOfMediasSelected() {
	const numberOfMediasSelected = useAllSelectedMedias(sizeSelector);

	return (
		<p>
			{numberOfMediasSelected === 0 ? "" : `${numberOfMediasSelected} selected`}
		</p>
	);
}
