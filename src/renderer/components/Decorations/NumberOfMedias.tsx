import { useTranslation } from "@i18n";
import { usePlaylists } from "@contexts/usePlaylists";

const sizeSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByDate.size;

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists(sizeSelector);
	const { t } = useTranslation();

	return (
		<p>
			{numberOfMedias} {t("decorations.medias")}
		</p>
	);
}
