import { SearchMedia, MediaListKind } from "@components";

import { MainArea } from "../Home";

export function Favorites() {
	return (
		<MainArea>
			<SearchMedia fromList="favorites" buttonToTheSide="nothing" />

			<MediaListKind mediaType="favorites" />
		</MainArea>
	);
}
