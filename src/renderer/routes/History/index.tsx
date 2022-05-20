import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";

export function History() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSideEnum.CLEAN}
				fromList={PlaylistList.HISTORY}
			/>

			<MediaListKind fromList={PlaylistList.HISTORY} />
		</MainArea>
	);
}
