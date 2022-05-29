import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { ButtonGroup } from "@components/ButtonGroup";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

export function Home() {
	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<ButtonGroup
					buttons={{
						reload: true,
						sortBy: true,
					}}
				/>
			</Header>

			<MediaListKind fromList={PlaylistList.MAIN_LIST} />
		</MainArea>
	);
}
