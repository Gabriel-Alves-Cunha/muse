import { useEffect } from "react";

import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/usePlaylists";
import { ButtonGroup } from "@components/ButtonGroup";
import { SearchMedia } from "@components/SearchMedia";
import { setFromList } from "@components/MediaListKind/helper";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";
import { t } from "@components/I18n";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function History() {
	useTitle(t("titles.history"));

	useEffect(() => {
		setFromList({ fromList: PlaylistList.HISTORY });
	}, []);

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<ButtonGroup clean />
			</Header>

			<MediaListKind />
		</MainArea>
	);
}
