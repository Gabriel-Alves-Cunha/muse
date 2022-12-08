import { useTranslation } from "@i18n";
import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Home() {
	const { t } = useTranslation();

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
