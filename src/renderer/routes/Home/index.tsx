import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";

export function Home() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSideEnum.RELOAD_BUTTON}
				fromList={PlaylistList.MAIN_LIST}
			/>

			<MediaListKind fromList={PlaylistList.MAIN_LIST} />
		</MainArea>
	);
}
