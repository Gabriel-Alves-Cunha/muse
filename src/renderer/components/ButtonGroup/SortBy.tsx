import { BsSortDown as SortIcon } from "react-icons/bs";
import { useEffect, useState } from "react";

import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { setFromList } from "@components/MediaListKind/helper";
import { Select } from "@components/SelectButton";

import { Button } from "./styles";

export function SortBy({ className }: Props) {
	const [selectedList, setSelectedList] = useState<SelectedList>("None");

	useEffect(() => {
		let fromList = PlaylistList.MAIN_LIST;

		if (selectedList === "Name") fromList = PlaylistList.SORTED_BY_NAME;
		else if (selectedList === "Date") fromList = PlaylistList.SORTED_BY_DATE;

		setFromList({ fromList });
	}, [selectedList]);

	return (
		<Select
			setValue={setSelectedList as (value: SelectedList) => void}
			value={selectedList}
		>
			<Button className={className}>
				<SortIcon size={17} />
			</Button>
		</Select>
	);
}

type Props = { className?: string };

type SelectedList = "Name" | "Date" | "None";
