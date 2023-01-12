import { useTranslation } from "@i18n";
import { usePlaylists } from "@contexts/usePlaylists";

const sizeSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByDate.size;

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists(sizeSelector);
	const { t } = useTranslation();

	const plural = numberOfMedias > 1;

	return (
		<p>
			{numberOfMedias} {t("decorations.media")}
			{plural ? "s" : ""}
		</p>
	);
}
