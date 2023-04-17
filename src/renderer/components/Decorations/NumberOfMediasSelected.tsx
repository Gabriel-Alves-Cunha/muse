import { selectT, useTranslator } from "@i18n";
import {
	type AllSelectedMedias,
	allSelectedMediasRef,
} from "@contexts/allSelectedMedias";

const selectAllSelectedMediasSize = (state: AllSelectedMedias): number =>
	state.current.size;

export function NumberOfMediasSelected(): JSX.Element | null {
	const numberOfMediasSelected = allSelectedMediasRef(
		selectAllSelectedMediasSize,
	);
	const t = useTranslator(selectT);

	return numberOfMediasSelected === 0 ? null : (
		<p>
			{numberOfMediasSelected} {t("decorations.selected")}
		</p>
	);
}
