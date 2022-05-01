import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSideEnum } from "@components/SearchMedia/helper";
import { HISTORY } from "@contexts";

export function History() {
	return (
		<MainArea>
			<SearchMedia playlistName={HISTORY} buttonToTheSide={ButtonToTheSideEnum.CLEAN} />

			<MediaListKind playlistName={HISTORY} />
		</MainArea>
	);
}
