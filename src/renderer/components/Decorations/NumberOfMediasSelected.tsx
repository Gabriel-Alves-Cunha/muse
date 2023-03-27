import { useSnapshot } from "valtio";

import { allSelectedMedias } from "@contexts/allSelectedMedias";
import { translation } from "@i18n";

export function NumberOfMediasSelected() {
	const allSelectedMediasAccessor = useSnapshot(allSelectedMedias);
	const t = useSnapshot(translation).t;

	const numberOfMediasSelected = allSelectedMediasAccessor.size;
	const isPlural = numberOfMediasSelected > 1;

	return numberOfMediasSelected === 0 ? null : (
		<p>
			{numberOfMediasSelected} {t("decorations.selected")}
		</p>
	);
}
