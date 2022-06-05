import { useEffect } from "react";

import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { ButtonGroup } from "@components/ButtonGroup";
import { SearchMedia } from "@components/SearchMedia";
import { setFromList } from "@components/MediaListKind/helper";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

export function Favorites() {
	useEffect(() => {
		setFromList({ fromList: PlaylistList.FAVORITES });
	}, []);

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<ButtonGroup buttons={{ clean: true }} />
			</Header>

			<MediaListKind />
		</MainArea>
	);
}
