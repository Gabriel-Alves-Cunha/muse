import { useEffect, useRef } from "react";

import { FlipCard, mediaPlayerFlipCardId } from "../FlipCard";
import { useCurrentPlaying } from "@contexts/useCurrentPlaying";
import { usePlaylists } from "@contexts/usePlaylists";
import { Lyrics } from "./Lyrics";
import { Player } from "./Player";
import {
	logSecurityPolicyViolation,
	handleAudioCanPlay,
	handleLoadedData,
	mainListSelector,
	handleEnded,
	pathSelector,
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
	const path = useCurrentPlaying(pathSelector);

	const media = mainList.get(path);
	const audio = audioRef.current;

	useEffect(() => {
		// Flip media player card to frontCard:
		document.getElementById(mediaPlayerFlipCardId)?.classList.remove("active");
	}, [path]);

	// Setting event listeners:
	useEffect(() => {
		if (!(audio && media)) return;

		// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
		audio.addEventListener("loadeddata", handleLoadedData);

		audio.onsecuritypolicyviolation = logSecurityPolicyViolation;
		// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
		audio.oncanplay = handleAudioCanPlay;
		audio.oninvalid = logInvalid;
		audio.onstalled = logStalled;
		// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
		audio.onended = handleEnded;
		audio.onerror = logError;
		audio.onabort = logAbort;
		audio.onclose = logClose;

		return () => {
			// @ts-ignore => I've just narrowed down the event so that event.target === HTMLAudioElement:
			audio.removeEventListener("loadeddata", handleLoadedData);
		};
	}, [media, path]);

	return (
		<aside className="aside">
			<audio id="audio" ref={audioRef} />

			<FlipCard
				frontCard={<Player media={media} path={path} />}
				backCard={<Lyrics media={media} path={path} />}
			/>
		</aside>
	);
}
