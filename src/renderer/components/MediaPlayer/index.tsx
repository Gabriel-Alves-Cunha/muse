import { useEffect, useRef } from "react";

import { MediaPlayerCards } from "./MediaPlayerCards";
import { error } from "@common/log";
import {
	logSecurityPolicyViolation,
	handleAudioCanPlay,
	handleLoadedData,
	handleEnded,
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

export function MediaPlayer(): JSX.Element {
	const audioRef = useRef<HTMLAudioElement>(null);

	// Setting event listeners:
	useEffect(() => {
		const audio = audioRef.current;

		if (!audio) return error("Audio is not on UI!");

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
	}, []);

	return (
		<aside className="aside">
			{/* rome-ignore lint/a11y/useMediaCaption: Doesn't make sense to use media caption here.  */}
			<audio id="audio" ref={audioRef} />

			<MediaPlayerCards />
		</aside>
	);
}
