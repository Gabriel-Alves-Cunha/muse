import { MediaListKind, SearchMedia, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia/helper";
import { MAIN_LIST } from "@contexts";

export function Home() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.RELOAD_BUTTON}
				playlistName={MAIN_LIST}
			/>

			<MediaListKind playlistName={MAIN_LIST} />
		</MainArea>
	);
}
