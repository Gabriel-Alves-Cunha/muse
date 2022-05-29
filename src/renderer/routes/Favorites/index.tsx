import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { ButtonGroup } from "@components/ButtonGroup";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

export function Favorites() {
	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<ButtonGroup buttons={{ clean: true }} />
			</Header>

			<MediaListKind fromList={PlaylistList.FAVORITES} />
		</MainArea>
	);
}
