import type { ValuesOf } from "@common/@types/utils";

import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { SelectContent, SelectItem, SelectTrigger } from "../Select";
import { useTranslation } from "@i18n";
import { playlistList } from "@common/enums";
import { setFromList } from "../MediaListKind/states";

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
				htmlTargetName={selectOrderOptionsId}
				title={t("tooltips.sortBy")}
			>
				<SortIcon size={19} className="fill-white" />
			</SelectTrigger>

			<SelectContent htmlFor={selectOrderOptionsId}>
				<SelectItem
					onPointerUp={() => {
						setSelectedList("Name");
						closeSelect();
					}}
				>
					{t("sortTypes.name")}
				</SelectItem>

				<SelectItem
					onPointerUp={() => {
						setSelectedList("Date");
						closeSelect();
					}}
				>
					{t("sortTypes.date")}
				</SelectItem>
			</SelectContent>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type SelectedList = "Name" | "Date";
