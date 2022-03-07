import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { HISTORY } from "@contexts/mediaHandler/usePlaylistsHelper";
import { dbg } from "@common/utils";

export function History() {
	dbg("Here at routes/History");

	return (
		<MainArea>
			<SearchMedia fromList={HISTORY} buttonToTheSide={ButtonToTheSide.CLEAN} />

			<MediaListKind mediaType={HISTORY} />
		</MainArea>
	);
}
