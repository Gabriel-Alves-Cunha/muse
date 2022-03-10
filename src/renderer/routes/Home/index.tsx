import { MediaListKind, SearchMedia, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { MEDIA_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import { dbg } from "@common/utils";

export function Home() {
	dbg("Here at routes/Home");

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
