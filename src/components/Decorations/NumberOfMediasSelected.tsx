import { useAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { useTranslation } from "@i18n";

const sizeSelector = (
	state: ReturnType<typeof useAllSelectedMedias.getState>,
) => state.medias.size;

export function NumberOfMediasSelected() {
	const numberOfMediasSelected = useAllSelectedMedias(sizeSelector);
	const { t } = useTranslation();

	const plural = numberOfMediasSelected > 1;

	return numberOfMediasSelected === 0 ? null : (
		<p>
			{numberOfMediasSelected} {t("decorations.selected")}
			{plural ? "s" : ""}
		</p>
	);
}
