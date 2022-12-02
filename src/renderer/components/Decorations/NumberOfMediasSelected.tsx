import { useAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { useI18n } from "@solid-primitives/i18n";

export function NumberOfMediasSelected() {
	const numberOfMediasSelected = useAllSelectedMedias(
		(state) => state.medias.size,
	);
	const [t] = useI18n();

	return numberOfMediasSelected === 0 ? null : (
		<p>
			{numberOfMediasSelected} {t("decorations.selected")}
		</p>
	);
}
