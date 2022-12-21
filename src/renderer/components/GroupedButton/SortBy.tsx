import type { ValuesOf } from "@common/@types/utils";

import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { contentOfSelectEnum, Select } from "@components/Select";
import { useTranslation } from "@i18n";
import { playlistList } from "@common/enums";
import { setFromList } from "@components/MediaListKind/states";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export const SortBy = () => {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");
	const { t } = useTranslation();

	useEffect(() => {
		// Default value:
		let homeList: ValuesOf<typeof playlistList> = playlistList.mainList;

		if (selectedList === "Date") homeList = playlistList.sortedByDate;

		setFromList({ homeList });
	}, [selectedList]);

	return (
		<Select
			content={contentOfSelectEnum.GROUPED_BUTTON_SORT_BY}
			triggerClassName="grouped-button" // Same as ButtonOfGroup.
			tooltip={t("tooltips.sortBy")}
			setValue={setSelectedList}
			value={selectedList}
		>
			<SortIcon size={19} className="fill-white" />
		</Select>
	);
};

type SelectedList = "Name" | "Date";
