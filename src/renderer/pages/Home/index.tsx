import { MediaListKind, SearchMedia } from "@components";

import { MainArea } from "./styles";

export function Home() {
	return (
		<MainArea>
			<SearchMedia fromList="mediaList" buttonToTheSide="reload button" />

			<MediaListKind mediaType="mediaList" />
		</MainArea>
	);
}
