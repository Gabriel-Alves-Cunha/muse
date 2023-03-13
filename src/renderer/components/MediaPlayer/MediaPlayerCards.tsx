import { useSnapshot } from "valtio";
import { useEffect } from "react";

import { FlipCard, mediaPlayerFlipCardId } from "@components/FlipCard";
import { currentPlaying } from "@contexts/currentPlaying";
import { playlists } from "@contexts/playlists";
import { Player } from "./Player";
import { Lyrics } from "./Lyrics";

export function MediaPlayerCards() {
	const currentPlayingAccessor = useSnapshot(currentPlaying);
	const playlistsAccessor = useSnapshot(playlists);

	const path = currentPlayingAccessor.path;
	const media = playlistsAccessor.sortedByTitleAndMainList.get(path);

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
