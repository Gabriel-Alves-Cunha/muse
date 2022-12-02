import type { ValuesOf } from "@common/@types/utils";

import { createEffect, createSignal } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { contentOfSelectEnum, Select } from "../Select";
import { assertUnreachable } from "@utils/utils";
import { playlistList } from "@common/enums";
import { setFromList } from "../MediaListKind/helper";
import { SortIcon } from "@icons/SortIcon";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export function SortBy() {
	const [selectedList, setSelectedList] = createSignal<SelectedList>("Name");
	const [t] = useI18n();

	createEffect(() => {
		let homeList: ValuesOf<typeof playlistList> = playlistList.mainList;
		const list = selectedList();

		switch (list) {
			case "Name":
				break;

			case "Date": {
				homeList = playlistList.sortedByDate;
				break;
			}

			default:
				assertUnreachable(list);
		}

		setFromList({ homeList });
	});

	return (
		<Select
			content={contentOfSelectEnum.GROUPED_BUTTON_SORT_BY}
			tooltip={t("tooltips.sortBy")}
			triggerClass="grouped-button" // Same as ButtonOfGroup.
			setValue={setSelectedList}
			value={selectedList()}
		>
			<SortIcon class="w-5 h-5 fill-white" />
		</Select>
	);
}

type SelectedList = "Name" | "Date";
