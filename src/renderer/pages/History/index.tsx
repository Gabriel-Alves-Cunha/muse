import { SearchMedia, MediaListKind } from "@components";

import { MainArea } from "../Home/styles";

export function History() {
	return (
		<MainArea>
			<SearchMedia fromList="history" buttonToTheSide="clean" />

			<MediaListKind mediaType="history" />
		</MainArea>
	);
}
