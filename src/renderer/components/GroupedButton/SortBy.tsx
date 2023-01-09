import type { ValuesOf } from "@common/@types/utils";

import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { useTranslation } from "@i18n";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { playlistList } from "@common/enums";
import { setFromList } from "../MediaListKind/states";
import { MenuItem } from "../MenuItem";
import { Select } from "../Select";

export function SortBy() {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		// Default value:
		let homeList: ValuesOf<typeof playlistList> = playlistList.mainList;

		if (selectedList === "Date") homeList = playlistList.sortedByDate;

		setFromList({ homeList });
	}, [selectedList]);

	return (
		<>
			<ButtonOfGroup
				onPointerUp={() => setIsOpen(true)}
				title={t("tooltips.sortBy")}
				className="rounded-r-xl" // Same as ButtonOfGroup.
			>
				<SortIcon size="19" className="fill-white" />
			</ButtonOfGroup>

			<Select isOpen={isOpen}>
				<MenuItem
					onPointerUp={() => {
						setSelectedList("Name");
						setIsOpen(false);
					}}
				>
					{t("sortTypes.name")}
				</MenuItem>

				<MenuItem
					onPointerUp={() => {
						setSelectedList("Date");
						setIsOpen(false);
					}}
				>
					{t("sortTypes.date")}
				</MenuItem>
			</Select>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type SelectedList = "Name" | "Date";
