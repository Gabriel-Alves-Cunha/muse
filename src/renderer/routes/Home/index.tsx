import { MediaListKind } from "@components/MediaListKind";
import { ButtonGroup } from "@components/ButtonGroup";
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

				<ButtonGroup reload sortBy />
			</Header>

			<MediaListKind isHome />
		</MainArea>
	);
}
