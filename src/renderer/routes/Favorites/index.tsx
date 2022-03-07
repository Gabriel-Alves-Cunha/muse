import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { FAVORITES } from "@contexts/mediaHandler/usePlaylistsHelper";
import { dbg } from "@common/utils";

export function Favorites() {
	dbg("Here at routes/Favorites");

	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.NOTHING}
				fromList={FAVORITES}
			/>

			<MediaListKind mediaType={FAVORITES} />
		</MainArea>
	);
}
