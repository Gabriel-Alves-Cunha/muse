import { usePlaylists } from "@contexts/usePlaylists";
import { useI18n } from "@solid-primitives/i18n";

export function NumberOfMedias() {
	const numberOfMedias = usePlaylists((state) => state.sortedByDate.size);
	const [t] = useI18n();

	return (
		<p>
			{numberOfMedias} {t("decorations.medias")}
		</p>
	);
}
