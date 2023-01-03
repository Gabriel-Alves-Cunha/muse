import { useEffect, useRef } from "react";

import { FlipCard, mediaPlayerFlipCardId } from "../FlipCard";
import { useCurrentPlaying } from "@contexts/useCurrentPlaying";
import { usePlaylists } from "@contexts/usePlaylists";
import { Lyrics } from "./Lyrics";
import { Player } from "./Player";
import { log } from "@common/log";
import {
	logSecurityPolicyViolation,
	handleAudioCanPlay,
	handleLoadedData,
	mainListSelector,
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

	const media = mainList.get(id);

	useEffect(() => {
		// Flip media player card to frontCard:
		log("flipMediaPlayerCardToNormalPlayer", audioRef.current?.src);

		document.getElementById(mediaPlayerFlipCardId)?.classList.remove("flip-card-active");
	}, [audioRef.current?.src]);

	useEffect(() => {
		// Setting event listeners:

		const audio = audioRef.current;
		if (!(audio && media)) return;

		audio.onsecuritypolicyviolation = logSecurityPolicyViolation;
		// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
		audio.onloadeddata = handleLoadedData;
		// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
		audio.oncanplay = handleAudioCanPlay;
		audio.oninvalid = logInvalid;
		audio.onstalled = logStalled;
		// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
		audio.onended = handleEnded;
		audio.onerror = logError;
		audio.onabort = logAbort;
		audio.onclose = logClose;
	}, [media, id]);

	return (
		<aside className="aside">
			<audio id="audio" ref={audioRef} />

			<FlipCard
				frontCard={<Player audio={audioRef.current} media={media} id={id} />}
				backCard={<Lyrics media={media} id={id} />}
			/>
		</aside>
	);
}
