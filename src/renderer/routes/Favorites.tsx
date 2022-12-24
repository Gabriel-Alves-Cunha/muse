import { useEffect } from "react";

import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { playlistList } from "@common/enums";
import { setFromList } from "@components/MediaListKind/states";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export default function Favorites() {
	useEffect(() => setFromList({ fromList: playlistList.favorites }), []);

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<GroupedButton clean />
			</Header>

			<MediaListKind />
		</MainArea>
	);
}
