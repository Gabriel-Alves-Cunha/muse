import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { MediaListKind } from "@components/MediaListKind";
import { SearchMedia } from "@components/SearchMedia";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import { MainArea } from "@components/MainArea";

export function Home() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSideEnum.RELOAD_BUTTON}
				playlistName={MAIN_LIST}
			/>

			<MediaListKind playlistName={MAIN_LIST} />
		</MainArea>
	);
}
