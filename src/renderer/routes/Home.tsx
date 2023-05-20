import { useEffect } from "react";

import { setListTypeToDisplay } from "@components/MediaListKind/states";
import { PlaylistListEnum } from "@common/enums";
import { GroupedButton } from "@components/GroupedButton";
import { MediaListKind } from "@components/MediaListKind";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Home(): JSX.Element {
	useEffect(() => {
		setListTypeToDisplay({ current: PlaylistListEnum.mainList });
	}, []);

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<GroupedButton reload sortBy />
			</Header>

			<MediaListKind isHome />
		</MainArea>
	);
}
