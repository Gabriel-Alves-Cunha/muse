import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";
import { t } from "@components/I18n";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Home() {
	useTitle(t("titles.home"));

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
