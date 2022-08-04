import type { Media, Path } from "@common/@types/generalTypes";

import { mediaPlayerCard } from "@components/FlipCard";
import { Header } from "./helpers";

import { LyricsCardWrapper, LyricsHolder } from "./styles";

/////////////////////////////////////////

export function Lyrics({ media, path }: Props) {
	return (
		<LyricsCardWrapper>
			<Header media={media} path={path} displayTitle />

			<LyricsHolder>
				<p>{media?.lyrics}</p>
			</LyricsHolder>
		</LyricsCardWrapper>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

export function flipMediaPlayerCard(): void {
	document.getElementById(mediaPlayerCard)?.classList.toggle("active");
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ media: Media | undefined; path: Path; }>;
