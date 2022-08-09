import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { assertUnreachable } from "@utils/utils";
import { PlaylistList } from "@contexts/usePlaylists";
import { setFromList } from "@components/MediaListKind/helper";
import { Select } from "@components/Select";
import { t } from "@components/I18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export function SortBy({ className }: Props) {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");

	useEffect(() => {
		// Default value:
		let homeList = PlaylistList.MAIN_LIST;

		switch (selectedList) {
			case "Name":
				homeList = PlaylistList.MAIN_LIST;
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
			setValue={setSelectedList as (value: SelectedList) => void}
			tooltip={t("tooltips.sortBy")}
			triggerClassName={className}
			value={selectedList}
		>
			<SortIcon size={19} />
		</Select>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ className?: string; }>;

/////////////////////////////////////////////

type SelectedList = "Name" | "Date";
