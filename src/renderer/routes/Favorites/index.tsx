import { HeaderButtons, HeaderButtonsEnum } from "@components/HeaderButtons";
import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

export function Favorites() {
	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<HeaderButtons
					buttons={[HeaderButtonsEnum.CLEAN]}
					list={PlaylistList.FAVORITES}
				/>
			</Header>

			<MediaListKind fromList={PlaylistList.FAVORITES} />
		</MainArea>
	);
}
