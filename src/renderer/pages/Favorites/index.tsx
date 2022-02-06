import { SearchMedia, MediaListKind } from "@components";
import { ButtonToTheSide } from "@renderer/components/SearchMedia";
import { MainArea } from "../Home";

export function Favorites() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.NOTHING}
				fromList="favorites"
			/>

			<MediaListKind mediaType="favorites" />
		</MainArea>
	);
}
