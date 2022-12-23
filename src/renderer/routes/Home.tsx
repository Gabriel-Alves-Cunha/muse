import { ModalContent, ModalTrigger } from "@components/Modal";
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

export default function Home() {
	const { t } = useTranslation();

	useTitle(t("titles.home"));

	return (
		<MainArea>
			<Header>
				<SearchMedia />

				<GroupedButton reload sortBy />
			</Header>

			<>
				<ModalTrigger htmlTargetName="home-modal">Open tree modal</ModalTrigger>

				<ModalContent htmlFor="home-modal" blur closeOnClickOutside>
					Hello from the outside
				</ModalContent>
			</>

			<MediaListKind isHome />
		</MainArea>
	);
}
