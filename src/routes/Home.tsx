import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export default function Home() {
	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<GroupedButton reload sortBy />
			</Header>

			<MediaListKind isHome />
		</MainArea>
	);
}
