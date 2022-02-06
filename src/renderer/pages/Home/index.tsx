import styled from "@emotion/styled";

import { MediaListKind, SearchMedia } from "@components";
import { ButtonToTheSide } from "@renderer/components/SearchMedia";

export function Home() {
	return (
		<MainArea>
			<SearchMedia
				buttonToTheSide={ButtonToTheSide.RELOAD_BUTTON}
				fromList="mediaList"
			/>

			<MediaListKind mediaType="mediaList" />
		</MainArea>
	);
}

export const MainArea = styled.div`
	flex-direction: column;
	position: relative;
	display: flex;

	height: 100%;
	width: 100%;

	@media (max-width: 500px) {
		header {
			justify-content: center;
			margin-left: 0;
		}
	}
`;
