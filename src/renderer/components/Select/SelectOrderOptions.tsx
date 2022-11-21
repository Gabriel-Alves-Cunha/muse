import { SelectItem } from "./SelectItem";
import { t } from "@components/I18n";

// The values have to follow `type SelectedList`!!
export const SelectOrderOptions = () => (
	<>
		<SelectItem value="Name" title={t("sortTypes.name")} />

		<SelectItem value="Date" title={t("sortTypes.date")} />
	</>
);
