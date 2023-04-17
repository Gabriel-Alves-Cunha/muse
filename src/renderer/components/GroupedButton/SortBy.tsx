import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useCallback, useState } from "react";

import { selectT, useTranslator } from "@i18n";
import { setListTypeToDisplay } from "../MediaListKind/states";
import { PlaylistListEnum } from "@common/enums";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { MenuItem } from "../MenuItem";
import { Select } from "../Select";

export function SortBy(): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslator(selectT);

	const open = useCallback(() => setIsOpen(true), []);

	const selectNameAndClose = useCallback(() => {
		setHomeListToDisplay("Name");
		setIsOpen(false);
	}, []);

	const selectDateAndClose = useCallback(() => {
		setHomeListToDisplay("Date");
		setIsOpen(false);
	}, []);

	return (
		<>
			<ButtonOfGroup
				title={t("tooltips.sortBy")}
				className="rounded-r-xl" // Same as ButtonOfGroup.
				onPointerUp={open}
			>
				<SortIcon size="19" className="fill-white" />
			</ButtonOfGroup>

			<Select isOpen={isOpen} setIsOpen={setIsOpen}>
				<MenuItem defaultChecked onPointerUp={selectNameAndClose}>
					{t("sortTypes.name")}
				</MenuItem>

				<MenuItem onPointerUp={selectDateAndClose}>
					{t("sortTypes.date")}
				</MenuItem>
			</Select>
		</>
	);
}

const setHomeListToDisplay = (list: SelectedList): void =>
	setListTypeToDisplay({
		homeListToDisplay:
			list === "Date"
				? PlaylistListEnum.sortedByDate
				: PlaylistListEnum.mainList,
	});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type SelectedList = "Name" | "Date";
