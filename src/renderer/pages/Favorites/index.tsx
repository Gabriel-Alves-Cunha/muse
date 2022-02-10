import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";

const list = "favorites";

export const Favorites = () => (
	<MainArea>
		<SearchMedia buttonToTheSide={ButtonToTheSide.NOTHING} fromList={list} />

		<MediaListKind mediaType={list} />
	</MainArea>
);
