import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { dbg } from "@common/utils";

const list = "favorites";

export function Favorites() {
	dbg("Here at routes/Favorites");

	return (
		<MainArea>
			<SearchMedia buttonToTheSide={ButtonToTheSide.NOTHING} fromList={list} />

			<MediaListKind mediaType={list} />
		</MainArea>
	);
}
