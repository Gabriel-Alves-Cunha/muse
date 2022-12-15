import type { ID, Media } from "@common/@types/generalTypes";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef } from "react";
import { randomUUID } from "crypto";
import create from "zustand";

import { FlipCard, mediaPlayerCardId } from "@components/FlipCard";
import { refreshMedia, usePlaylists } from "@contexts/usePlaylists";
import { ControlsAndSeeker } from "./Controls";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { formatDuration } from "@common/utils";
import { log, error } from "@utils/log";
import { Header } from "./Header";
import { Lyrics } from "./Lyrics";
import { dbg } from "@common/debug";
import {
	useCurrentPlaying,
	getCurrentPlaying,
	playNextMedia,
} from "@contexts/useCurrentPlaying";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Helper constants:

export const useProgress = create<Progress>(() => ({
	currentTime: 0,
	percentage: 0,
}));

const { setState: setProgress } = useProgress;

///////////////////////////////////////

const idSelector = (state: ReturnType<typeof useCurrentPlaying.getState>) =>
	state.id;

///////////////////////////////////////

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByTitleAndMainList;

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

		const lambdaHandleProgress = () =>
			handleProgress(audio, isSeekingRef.current);
		const lambdaHandleLoadedData = () => handleLoadedData(audio, id, media);
		const lambdaHandleAudioCanPlay = () => handleAudioCanPlay(audio);
		const lambdaHandleEnded = () => handleEnded(audio);

		// Adding event listeners:
		audio.addEventListener("loadeddata", lambdaHandleLoadedData);
		audio.addEventListener("canplay", lambdaHandleAudioCanPlay);
		audio.addEventListener("timeupdate", lambdaHandleProgress);
		audio.addEventListener("ended", lambdaHandleEnded);
		audio.addEventListener("invalid", logInvalid);
		audio.addEventListener("stalled", logStalled);
		audio.addEventListener("ended", playNextMedia);
		audio.addEventListener("error", logError);
		audio.addEventListener("abort", logAbort);
		audio.addEventListener("close", logClose);
		audio.addEventListener(
			"securitypolicyviolation",
			logSecurityPolicyViolation,
		);

		return () => {
			audio.removeEventListener("loadeddata", lambdaHandleLoadedData);
			audio.removeEventListener("canplay", lambdaHandleAudioCanPlay);
			audio.removeEventListener("timeupdate", lambdaHandleProgress);
			audio.removeEventListener("ended", lambdaHandleEnded);
			audio.removeEventListener("invalid", logInvalid);
			audio.removeEventListener("stalled", logStalled);
			audio.removeEventListener("ended", playNextMedia);
			audio.removeEventListener("error", logError);
			audio.removeEventListener("abort", logAbort);
			audio.removeEventListener("close", logClose);
			audio.removeEventListener(
				"securitypolicyviolation",
				logSecurityPolicyViolation,
			);
		};
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

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const Player = ({ media, audio, id, isSeeking }: PlayerProps) => (
	<>
		<Header media={media} id={id} />

		<div className="aspect-square rounded-2xl flex items-center justify-center w-full shadow-reflect mt-[25%]">
			<ImgWithFallback
				Fallback={<MusicNote size={30} />}
				mediaImg={media?.image}
				mediaID={id}
			/>
		</div>

		<div className="flex flex-col justify-center items-center h-[10vh] w-full mt-[3vh]">
			<span
				className="flex justify-center items-center w-full text-icon-media-player flex-wrap font-secondary tracking-wide text-center overflow-y-hidden text-xl font-medium"
				id="title"
			>
				{media?.title}
			</span>

			<span
				className="flex justify-center items-center w-full text-icon-media-player flex-wrap font-secondary tracking-wide text-center overflow-y-hidden text-sm font-normal"
				id="subtitle"
			>
				{media?.artist}
			</span>
		</div>

		<ControlsAndSeeker audio={audio} isSeeking={isSeeking} />
	</>
);

/////////////////////////////////////////

const logInvalid = (e: Event): void => dbg("Audio is invalid.", e);
const logAbort = (): void => dbg("Audio was aborted.");
const logClose = (): void => dbg("Audio was closed.");
const logSecurityPolicyViolation = (e: Event): void =>
	error("Audio has a security policy violation:", e);
const logError = (e: Event): void => error("Audio error:", e);
const logStalled = (e: Event): void =>
	dbg(
		"Audio is stalled (Fires when the browser is trying to get media data, but it is not available):",
		e,
	);

/////////////////////////////////////////

const handleLoadedData = (
	audio: HTMLAudioElement,
	oldID: ID,
	media: Media,
): void => {
	const formatedDuration = formatDuration(audio.duration);

	// Updating the duration of media:
	if (formatedDuration !== media.duration) {
		const newID = randomUUID();

		refreshMedia(oldID, newID, { ...media, duration: formatedDuration });
	}

	// Maybe set audio.currentTime to last stopped time:
	const lastTime = getCurrentPlaying().currentTime;
	if (lastTime > 30 /* seconds */) audio.currentTime = lastTime;
};

/////////////////////////////////////////

const handleEnded = (audio: HTMLAudioElement): void => {
	dbg(
		`Audio ended, playing ${
			audio.loop ? "again because it's on loop." : "next media."
		}`,
	);

	if (!audio.loop) playNextMedia();
};

/////////////////////////////////////////

const handleAudioCanPlay = (audio: HTMLAudioElement): void => {
	dbg("Audio can play.");
	audio.play().then();
};

/////////////////////////////////////////

const handleProgress = (audio: HTMLAudioElement, isSeeking: boolean): void => {
	const { duration, currentTime } = audio;

	// If is seeking, set just the currentTime:
	isSeeking
		? setProgress({ currentTime })
		: setProgress({ percentage: (currentTime / duration) * 100, currentTime });
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Progress = Readonly<{ currentTime: number; percentage: number }>;

/////////////////////////////////////////

type PlayerProps = {
	isSeeking: React.MutableRefObject<boolean>;
	audio: HTMLAudioElement | null;
	media: Media | undefined;
	id: ID;
};
