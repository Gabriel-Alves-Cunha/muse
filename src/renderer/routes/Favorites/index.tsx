import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";

export function Favorites() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSideEnum.NOTHING}
				fromList={PlaylistList.FAVORITES}
			/>

			<MediaListKind fromList={PlaylistList.FAVORITES} />
		</MainArea>
	);
}
