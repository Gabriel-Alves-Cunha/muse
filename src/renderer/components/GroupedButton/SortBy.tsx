import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { assertUnreachable } from "@utils/utils";
import { PlaylistList } from "@contexts/usePlaylists";
import { setFromList } from "@components/MediaListKind/helper";
import { contentOfSelectEnum, Select } from "@components/Select";
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

			case "Date":
				homeList = PlaylistList.SORTED_BY_DATE;
				break;

			default:
				assertUnreachable(selectedList);
		}

		setFromList({ homeList });
	}, [selectedList]);

	return (
		<Select
			content={contentOfSelectEnum.GROUPED_BUTTON_SORT_BY}
			tooltip={t("tooltips.sortBy")}
			setValue={setSelectedList}
			value={selectedList}
		>
			<SortIcon size={19} />
		</Select>
	);
}

type SelectedList = "Name" | "Date";
