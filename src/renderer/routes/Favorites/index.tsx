import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { FAVORITES } from "@contexts";

export function Favorites() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSideEnum.NOTHING}
				playlistName={FAVORITES}
			/>

			<MediaListKind playlistName={FAVORITES} />
		</MainArea>
	);
}
