import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";

const list = "history";

export const History = () => (
	<MainArea>
		<SearchMedia fromList={list} buttonToTheSide={ButtonToTheSide.CLEAN} />

		<MediaListKind mediaType={list} />
	</MainArea>
);
