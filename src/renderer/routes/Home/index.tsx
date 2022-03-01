import { MediaListKind, SearchMedia, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { dbg } from "@common/utils";

const list = "mediaList";

export function Home() {
	dbg("Here at routes/Home");

	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.RELOAD_BUTTON}
				fromList={list}
			/>

			<MediaListKind mediaType={list} />
		</MainArea>
	);
}
