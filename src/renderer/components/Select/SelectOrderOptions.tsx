import { useTranslation } from "@i18n";
import { SelectItem } from "./SelectItem";

// The values have to follow `type SelectedList`!!
export const SelectOrderOptions = () => {
	const { t } = useTranslation();

	return (
		<>
			<SelectItem value="Name" title={t("sortTypes.name")} />

			<SelectItem value="Date" title={t("sortTypes.date")} />
		</>
	);
};
