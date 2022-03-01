import { SearchMedia, MediaListKind, MainArea } from "@components";
import { ButtonToTheSide } from "@components/SearchMedia";
import { dbg } from "@common/utils";

const list = "history";

export function History() {
	dbg("Here at routes/History");

	return (
		<MainArea>
			<SearchMedia fromList={list} buttonToTheSide={ButtonToTheSide.CLEAN} />

			<MediaListKind mediaType={list} />
		</MainArea>
	);
}
