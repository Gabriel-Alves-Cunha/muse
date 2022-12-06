import type { ValuesOf } from "@common/@types/utils";

import { Component, createEffect, createSignal, on } from "solid-js";
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

export const SortBy: Component = () => {
	const [selectedList, setSelectedList] = createSignal<SelectedList>("Name");
	const [t] = useI18n();

	createEffect(
		on(
			selectedList,
			(list) => {
				let homeList: HomeList = playlistList.mainList;

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
			},
			{ defer: true },
		),
	);

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
};

type SelectedList = "Name" | "Date";

type HomeList = Extract<
	ValuesOf<typeof playlistList>,
	"sortedByNameAndMainList" | "sortedByDate"
>;
