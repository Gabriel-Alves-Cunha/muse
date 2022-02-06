import { SearchMedia, MediaListKind } from "@components";
import { ButtonToTheSide } from "@renderer/components/SearchMedia";
import { MainArea } from "../Home";

export function History() {
	return (
		<MainArea>
			<SearchMedia fromList="history" buttonToTheSide={ButtonToTheSide.CLEAN} />

			<MediaListKind mediaType="history" />
		</MainArea>
	);
}
