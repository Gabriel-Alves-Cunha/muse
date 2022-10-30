import { useAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { t } from "@components/I18n";

const sizeSelector = (
	state: ReturnType<typeof useAllSelectedMedias.getState>,
) => state.medias.size;

export function NumberOfMediasSelected() {
	const numberOfMediasSelected = useAllSelectedMedias(sizeSelector);

	return numberOfMediasSelected === 0 ? null : (
		<p>
			{numberOfMediasSelected} {t("decorations.selected")}
		</p>
	);
}
