import type { Media, Path } from "@common/@types/generalTypes";

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
// Types:

type Props = Readonly<{ media: Media | undefined; path: Path; }>;
