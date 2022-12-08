import { useEffect } from "react";

import { useTranslation } from "@i18n";
import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { playlistList } from "@common/enums";
import { SearchMedia } from "@components/SearchMedia";
import { setFromList } from "@components/MediaListKind/helper";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function History() {
	const { t } = useTranslation();

	useTitle(t("titles.history"));

	useEffect(() => setFromList({ fromList: playlistList.history }), []);

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<GroupedButton clean />
			</Header>

			<MediaListKind />
		</MainArea>
	);
}
