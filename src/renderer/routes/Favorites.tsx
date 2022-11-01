import { useEffect } from "react";

import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { PlaylistList } from "@contexts/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { setFromList } from "@components/MediaListKind/helper";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";
import { Main } from "@components/Main";
import { t } from "@components/I18n";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Favorites() {
	useTitle(t("titles.favorites"));

	useEffect(() => {
		setFromList({ fromList: PlaylistList.FAVORITES });
	}, []);

	return (
		<Main>
			<Header>
				<SearchMedia />

				<GroupedButton clean />
			</Header>

			<MediaListKind />
		</Main>
	);
}
