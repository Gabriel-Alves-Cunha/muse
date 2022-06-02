import { MdOutlineSort as SortIcon } from "react-icons/md";
import { useEffect, useState } from "react";

import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { setFromList } from "@components/MediaListKind/helper";
import { Select } from "@components/Select";

export function SortBy({ className }: Props) {
	const [selectedList, setSelectedList] = useState<SelectedList>("None");

	useEffect(() => {
		let fromList = PlaylistList.MAIN_LIST;

		if (selectedList === "Name") fromList = PlaylistList.MAIN_LIST;
		else if (selectedList === "Date") fromList = PlaylistList.SORTED_BY_DATE;

		setFromList({ fromList });
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

type SelectedList = "Name" | "Date" | "None";
