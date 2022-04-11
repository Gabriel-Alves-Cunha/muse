import { MediaListKind, SearchMedia, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";

export function Home() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.RELOAD_BUTTON}
				fromList={MAIN_LIST}
			/>

			<MediaListKind playlistName={MAIN_LIST} />
		</MainArea>
	);
}
