import { usePlaylists } from "@contexts/usePlaylists";
import { t } from "@components/I18n";

const sizeSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByDate.size;

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists(sizeSelector);

	return <p>{numberOfMedias} {t("decorations.medias")}</p>;
}
