import type { Component } from "solid-js";

import { MediaListKind } from "@components/MediaListKind";
import { GroupedButton } from "@components/GroupedButton";
import { SearchMedia } from "@components/SearchMedia";
import { MainArea } from "@components/MainArea";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

const Home: Component = () => (
	<MainArea>
		<Header>
			<SearchMedia />

			<GroupedButton reload sortBy />
		</Header>

		<MediaListKind isHome />
	</MainArea>
);

export default Home;
