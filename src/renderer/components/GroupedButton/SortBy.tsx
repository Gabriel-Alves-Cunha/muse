import type { ValuesOf } from "@common/@types/Utils";

import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";

import { PlaylistListEnum } from "@common/enums";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { translation } from "@i18n";
import { fromList } from "../MediaListKind/states";
import { MenuItem } from "../MenuItem";
import { Select } from "../Select";

export function SortBy() {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");
	const [isOpen, setIsOpen] = useState(false);
	const t = useSnapshot(translation).t;

	useEffect(() => {
		// Default value:
		let homeList: ValuesOf<typeof PlaylistListEnum> = PlaylistListEnum.mainList;

		if (selectedList === "Date") homeList = PlaylistListEnum.sortedByDate;

		fromList.homeList = homeList;
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

			<Select isOpen={isOpen} setIsOpen={setIsOpen}>
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
