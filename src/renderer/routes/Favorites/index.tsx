import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia/helper";
import { FAVORITES } from "@contexts";

export function Favorites() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.NOTHING}
				playlistName={FAVORITES}
			/>

			<MediaListKind playlistName={FAVORITES} />
		</MainArea>
	);
}
