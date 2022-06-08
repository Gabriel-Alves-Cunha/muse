import { MediaListKind } from "@components/MediaListKind";
import { ButtonGroup } from "@components/ButtonGroup";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

export const Home = () => (
	<MainArea>
		<Header>
			<SearchMedia />

			<ButtonGroup
				buttons={{
					reload: true,
					sortBy: true,
				}}
			/>
		</Header>

		<MediaListKind isHome />
	</MainArea>
);
