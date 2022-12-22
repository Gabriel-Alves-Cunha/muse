import { useEffect, useRef } from "react";

import { useCurrentPlaying, playNextMedia } from "@contexts/useCurrentPlaying";
import { FlipCard, mediaPlayerCardId } from "../FlipCard";
import { usePlaylists } from "@contexts/usePlaylists";
import { Lyrics } from "./Lyrics";
import { Player } from "./Player";
import { log } from "@common/log";
import {
	logSecurityPolicyViolation,
	handleAudioCanPlay,
	handleLoadedData,
	mainListSelector,
	handleProgress,
	handleEnded,
	idSelector,
	logInvalid,
	logStalled,
	logAbort,
	logClose,
	logError,
} from "./helpers";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Main function:

export function MediaPlayer() {
	const mainList = usePlaylists(mainListSelector);
	const audioRef = useRef<HTMLAudioElement>(null);
	const id = useCurrentPlaying(idSelector);
	const isSeekingRef = useRef(false);

	const media = mainList.get(id);

	useEffect(() => {
		// Flip media player card to normal player:
		log("flipMediaPlayerCardToNormalPlayer", audioRef.current?.src);

		document.getElementById(mediaPlayerCardId)?.classList.remove("active");
	}, [audioRef.current?.src]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!(audio && media)) return;

		// Setting event listeners:
		audio.ontimeupdate = () => handleProgress(audio, isSeekingRef.current);
		audio.onloadeddata = () => handleLoadedData(audio, id, media);
		audio.onsecuritypolicyviolation = logSecurityPolicyViolation;
		audio.oncanplay = () => handleAudioCanPlay(audio);
		audio.onended = (e) => handleEnded(e, audio);
		audio.oninvalid = logInvalid;
		audio.onstalled = logStalled;
		audio.onerror = logError;
		audio.onabort = logAbort;
		audio.onclose = logClose;
	}, [media, id]);

	return (
		<aside className="aside">
			<audio id="audio" ref={audioRef} />

			<FlipCard
				cardBack={<Lyrics media={media} id={id} />}
				cardFront={
					<Player
						isSeeking={isSeekingRef}
						audio={audioRef.current}
						media={media}
						id={id}
					/>
				}
			/>
		</aside>
	);
}
