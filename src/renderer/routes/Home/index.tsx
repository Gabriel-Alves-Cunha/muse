import { MediaListKind } from "@components/MediaListKind";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";
import { HeaderButtons, HeaderButtonsEnum } from "@components/HeaderButtons";

export function Home() {
	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<HeaderButtons
					buttons={[HeaderButtonsEnum.RELOAD_BUTTON]}
					list={PlaylistList.MAIN_LIST}
				/>
			</Header>

			<MediaListKind fromList={PlaylistList.MAIN_LIST} />
		</MainArea>
	);
}
