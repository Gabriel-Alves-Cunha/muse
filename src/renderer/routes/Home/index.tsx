import { MediaListKind, SearchMedia, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { MEDIA_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";

export function Home() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.RELOAD_BUTTON}
				fromList={MEDIA_LIST}
			/>

			<MediaListKind playlistName={MEDIA_LIST} />
		</MainArea>
	);
}
