import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { SelectItem } from "./SelectItem";

// The values have to follow `type SelectedList`!!
export const SelectOrderOptions: Component = () => {
	const [t] = useI18n();

	return (
		<>
			<SelectItem value="Name" title={t("sortTypes.name")} />

			<SelectItem value="Date" title={t("sortTypes.date")} />
		</>
	);
};
