import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia/helper";
import { HISTORY } from "@contexts/mediaHandler/usePlaylistsHelper";

export function History() {
	return (
		<MainArea>
			<SearchMedia fromList={HISTORY} buttonToTheSide={ButtonToTheSide.CLEAN} />

			<MediaListKind playlistName={HISTORY} />
		</MainArea>
	);
}
