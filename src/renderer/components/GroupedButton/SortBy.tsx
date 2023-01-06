import type { ValuesOf } from "@common/@types/utils";

import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { SelectContent, SelectTrigger } from "../Select";
import { useTranslation } from "@i18n";
import { playlistList } from "@common/enums";
import { setFromList } from "../MediaListKind/states";
import { MenuItem } from "../MenuItem";

const selectOrderOptionsId = "select-order-options-id";
const closeSelect = () =>
	document.getElementById(selectOrderOptionsId)?.click();

export function SortBy() {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");
	const { t } = useTranslation();

	useEffect(() => {
		// Default value:
		let homeList: ValuesOf<typeof playlistList> = playlistList.mainList;

		if (selectedList === "Date") homeList = playlistList.sortedByDate;

		setFromList({ homeList });
	}, [selectedList]);

	return (
		<>
			<SelectTrigger
				labelClassName="grouped-button rounded-r-xl" // Same as ButtonOfGroup.
				labelProps={{ title: t("tooltips.sortBy") }}
				htmlTargetName={selectOrderOptionsId}
			>
				<SortIcon size={19} className="fill-white" />
			</SelectTrigger>

			<SelectContent htmlFor={selectOrderOptionsId}>
				<MenuItem
					onPointerUp={() => {
						setSelectedList("Name");
						closeSelect();
					}}
				>
					{t("sortTypes.name")}
				</MenuItem>

				<MenuItem
					onPointerUp={() => {
						setSelectedList("Date");
						closeSelect();
					}}
				>
					{t("sortTypes.date")}
				</MenuItem>
			</SelectContent>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type SelectedList = "Name" | "Date";
