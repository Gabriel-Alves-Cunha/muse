import type { Media, Path } from "@common/@types/generalTypes";

import { Header } from "./helpers";

import { LyricsWrapper } from "./styles";

/////////////////////////////////////////

export function Lyrics({ media, path }: Props) {
	return (
		<LyricsWrapper>
			<Header media={media} path={path} />

			<div className="lyrics-holder">
				<p className="lyrics">{media?.lyrics}</p>
			</div>
		</LyricsWrapper>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ media: Media | undefined; path: Path; }>;
