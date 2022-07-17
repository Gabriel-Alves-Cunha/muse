import { useEffect } from "react";

import { MediaListKind } from "@components/MediaListKind";
import { ButtonGroup } from "@components/ButtonGroup";
import { SearchMedia } from "@components/SearchMedia";
import { MediasInfo } from "@components/MediasInfo";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Home() {
	useEffect(() => {
		document.title = "Audio list";
	}, []);

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<ButtonGroup buttons={{ reload: true, sortBy: true }} />
			</Header>

			<MediasInfo />

			<MediaListKind isHome />
		</MainArea>
	);
}
