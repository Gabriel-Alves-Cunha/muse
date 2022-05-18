import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { MediaListKind } from "@components/MediaListKind";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { HISTORY } from "@contexts/mediaHandler/usePlaylistsHelper";

export function History() {
	return (
		<MainArea>
			<SearchMedia
				playlistName={HISTORY}
				buttonToTheSide={ButtonToTheSideEnum.CLEAN}
			/>

			<MediaListKind playlistName={HISTORY} />
		</MainArea>
	);
}
