import { useAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { useTranslation } from "@i18n";

const sizeSelector = (
	state: ReturnType<typeof useAllSelectedMedias.getState>,
) => state.medias.size;

export const NumberOfMediasSelected = () => {
	const numberOfMediasSelected = useAllSelectedMedias(sizeSelector);
	const { t } = useTranslation();

	return numberOfMediasSelected === 0 ? null : (
		<p>
			{numberOfMediasSelected} {t("decorations.selected")}
		</p>
	);
};
