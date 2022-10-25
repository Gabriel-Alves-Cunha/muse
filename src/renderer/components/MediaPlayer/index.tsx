import type { Media, Path } from "@common/@types/generalTypes";

import { type MutableRefObject, useEffect, useRef } from "react";
import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import create from "zustand";

import { FlipCard, mediaPlayerCardId } from "@components/FlipCard";
import { ControlsAndSeeker } from "./Controls";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { formatDuration } from "@common/utils";
import { emptyString } from "@common/empty";
import { Header } from "./Header";
import { Lyrics } from "./Lyrics";
import { dbg } from "@common/debug";
import {
	PlaylistActions,
	usePlaylists,
	setPlaylists,
	WhatToDo,
} from "@contexts/usePlaylists";
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

const pathSelector = (state: ReturnType<typeof useCurrentPlaying.getState>) =>
	state.path;

///////////////////////////////////////

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByName;

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Main function:

export function MediaPlayer() {
	const mainList = usePlaylists(mainListSelector);
	const audioRef = useRef<HTMLAudioElement>(null);
	const path = useCurrentPlaying(pathSelector);
	const isSeekingRef = useRef(false);

	const media = mainList.get(path);

	function handleProgress(audio: HTMLAudioElement): void {
		const { duration, currentTime } = audio;

		setProgress({ currentTime });

		if (isSeekingRef.current === false)
			setProgress({ percentage: (currentTime / duration) * 100 });
	}

	useEffect(function flipMediaPlayerCardToNormalPlayer() {
		console.log("flipMediaPlayerCardToNormalPlayer", audioRef.current?.src);

		document.getElementById(mediaPlayerCardId)?.classList.remove("active");
	}, [audioRef.current?.src]);

	useEffect(() => {
		const audio = audioRef.current;
		if (audio === null || media === undefined) return;

		const lambdaHandleLoadedData = () => handleLoadedData(audio, path, media);
		const lambdaHandleAudioCanPlay = () => handleAudioCanPlay(audio);
		const lambdaHandleProgress = () => handleProgress(audio);
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
	}, [media, path]);

	return (
		// grid-media-player
		<aside className="relative inline-block justify-items-center items-center justify-self-center self-start h-[calc(100vh-var(--top-decorations-height))] w-full p-3 [&_svg]:text-icon-media-player">
			<audio id="audio" ref={audioRef} />

			<FlipCard
				cardBack={<Lyrics media={media} path={path} />}
				cardFront={
					<Player
						isSeeking={isSeekingRef}
						audio={audioRef.current}
						media={media}
						path={path}
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

const Player = ({ media, audio, path, isSeeking }: PlayerProps) => (
	<>
		<Header media={media} path={path} />

		<div className="grid relative self-center bg-none border-none mt-[25%] mx-[10%] mb-0 rounded-2xl after:content-[''] after:block after:pb-full">
			<div className="absolute flex flex-col justify-center items-center w-full h-full rounded-2xl">
				<ImgWithFallback
					Fallback={<MusicNote size={13} />}
					mediaImg={media?.image}
					mediaPath={path}
				/>
			</div>
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

const logInvalid = (e: Readonly<Event>): void => dbg("Audio is invalid.", e);
const logAbort = (): void => dbg("Audio was aborted.");
const logClose = (): void => dbg("Audio was closed.");
const logSecurityPolicyViolation = (e: Readonly<Event>): void =>
	console.error("Audio has a security policy violation:", e);
const logError = (e: Readonly<Event>): void => console.error("Audio error:", e);
const logStalled = (e: Readonly<Event>): void =>
	dbg(
		"Audio is stalled (Fires when the browser is trying to get media data, but it is not available):",
		e,
	);

/////////////////////////////////////////

function handleLoadedData(
	audio: HTMLAudioElement,
	path: Path,
	media: Media,
): void {
	const formatedDuration = formatDuration(audio.duration);

	if (formatedDuration !== media.duration)
		// Updating the duration of media:
		setPlaylists({
			newMedia: { ...media, duration: formatedDuration },
			whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newPath: emptyString,
			path,
		});

	// Maybe set audio.currentTime to last stopped time:
	const lastTime = getCurrentPlaying().currentTime;
	if (lastTime > 30 /* seconds */)
		audio.currentTime = lastTime;
}

/////////////////////////////////////////

function handleEnded(audio: HTMLAudioElement): void {
	dbg(
		`Audio ended, playing ${
			audio.loop === true ?
				"again because it's on loop." :
				"next media."
		}`,
	);

	if (audio.loop === false) playNextMedia();
}

/////////////////////////////////////////

async function handleAudioCanPlay(audio: HTMLAudioElement): Promise<void> {
	dbg("Audio can play.");
	await audio.play();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Progress = Readonly<{ currentTime: number; percentage: number; }>;

/////////////////////////////////////////

type PlayerProps = Readonly<
	{
		isSeeking: MutableRefObject<boolean>;
		audio: HTMLAudioElement | null;
		media: Media | undefined;
		path: Path;
	}
>;
