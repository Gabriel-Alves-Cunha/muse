import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { assertUnreachable } from "@utils/utils";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { setFromList } from "@components/MediaListKind/helper";
import { Select } from "@components/Select";

export function SortBy({ className }: Props) {
	const [selectedList, setSelectedList] = useState<SelectedList>("Name");

	useEffect(() => {
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
				break;
		}

		setFromList({ homeList });
	}, [selectedList]);

	return (
		<Select
			setValue={setSelectedList as (value: SelectedList) => void}
			triggerClassName={className}
			data-tooltip="Sort by"
			value={selectedList}
		>
			<SortIcon size={19} />
		</Select>
	);
}

type Props = { className?: string };

type SelectedList = "Name" | "Date";