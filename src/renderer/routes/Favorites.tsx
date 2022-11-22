import { useEffect } from "react";

import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { fromListState } from "@components/MediaListKind/helper";
import { PlaylistList } from "@contexts/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";
import { t } from "@components/I18n";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Favorites() {
	useTitle(t("titles.favorites"));

	useEffect(() => {
		fromListState.fromList.set(PlaylistList.FAVORITES);
	}, []);

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
