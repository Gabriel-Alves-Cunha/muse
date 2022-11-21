import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { contentOfSelectEnum, Select } from "@components/Select";
import { assertUnreachable } from "@utils/utils";
import { PlaylistList } from "@contexts/usePlaylists";
import { setFromList } from "@components/MediaListKind/helper";
import { t } from "@components/I18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export function SortBy() {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");

	useEffect(() => {
		// Default value:
		let homeList = PlaylistList.MAIN_LIST;

		switch (selectedList) {
			case "Name":
				break;

			case "Date": {
				homeList = PlaylistList.SORTED_BY_DATE;
				break;
			}

			default:
				assertUnreachable(selectedList);
		}

		setFromList({ homeList });
	}, [selectedList]);

	return (
		<Select
			triggerClassName="bg-button-hover px-5 h-9 transition-colors ease-linear active:scale-95 first:rounded-l-xl last:rounded-r-xl only:rounded-full" // Same as ButtonOfGroup.
			content={contentOfSelectEnum.GROUPED_BUTTON_SORT_BY}
			tooltip={t("tooltips.sortBy")}
			setValue={setSelectedList}
			value={selectedList}
		>
			<SortIcon size={19} className="fill-white" />
		</Select>
	);
}

type SelectedList = "Name" | "Date";
