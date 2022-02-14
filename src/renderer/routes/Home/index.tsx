import { MediaListKind, SearchMedia, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";

const list = "mediaList";

export const Home = () => (
	<MainArea>
		<SearchMedia
			buttonToTheSide={ButtonToTheSide.RELOAD_BUTTON}
			fromList={list}
		/>

		<MediaListKind mediaType={list} />
	</MainArea>
);
