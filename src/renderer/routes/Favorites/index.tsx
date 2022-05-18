import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { MediaListKind } from "@components/MediaListKind";
import { SearchMedia } from "@components/SearchMedia";
import { FAVORITES } from "@contexts/mediaHandler/usePlaylistsHelper";
import { MainArea } from "@components/MainArea";

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
