import { useEffect } from "react";

import { PlaylistListEnum } from "@common/enums";
import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { SearchMedia } from "@components/SearchMedia";
import { fromList } from "@components/MediaListKind/states";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function History() {
	useEffect(() => {
		fromList.curr = PlaylistListEnum.history;
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
