import { useEffect } from "react";

import { FlipCard, mediaPlayerFlipCardId } from "@components/FlipCard";
import { selectPath, useCurrentPlaying } from "@contexts/currentPlaying";
import { selectMainList, usePlaylists } from "@contexts/playlists";
import { Player } from "./Player";
import { Lyrics } from "./Lyrics";

export function MediaPlayerCards(): JSX.Element {
	const path = useCurrentPlaying(selectPath);
	const media = usePlaylists(selectMainList).get(path);

	useEffect(() => {
		// Flip media player card to frontCard on new path:
		document.getElementById(mediaPlayerFlipCardId)?.classList.remove("active");
	}, [path]);

	return (
		<FlipCard
			frontCard={<Player media={media} path={path} />}
			backCard={<Lyrics media={media} path={path} />}
		/>
	);
}
