import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { SearchMedia } from "@components/SearchMedia";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";
import { Main } from "@components/Main";
import { t } from "@components/I18n";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Home() {
	useTitle(t("titles.home"));

	return (
		<Main>
			<Header>
				<SearchMedia />

				<GroupedButton reload sortBy />
			</Header>

			<MediaListKind isHome />
		</Main>
	);
}
