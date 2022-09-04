import type { Media, Path } from "@common/@types/generalTypes";

import { type MutableRefObject, useEffect, useRef } from "react";
import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import create from "zustand";

import { ControlsAndSeeker } from "./Controls";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { formatDuration } from "@common/utils";
import { FlipCard } from "@components/FlipCard";
import { Header } from "./Header";
import { Lyrics } from "./Lyrics";
import { dbg } from "@common/utils";
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

import { SquareImage, Wrapper, Info } from "./styles";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const useProgress = create<Progress>(() => ({
	currentTime: 0,
	percentage: 0,
}));

const { setState: setProgress } = useProgress;

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Main function:

const currentPlayingPathSelector = (
	state: ReturnType<typeof useCurrentPlaying.getState>,
) => state.path;

///////////////////////////////////////

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByName;

///////////////////////////////////////

export function MediaPlayer() {
	const path = useCurrentPlaying(currentPlayingPathSelector);
	const mainList = usePlaylists(mainListSelector);
	const audioRef = useRef<HTMLAudioElement>(null);
	const isSeekingRef = useRef(false);

	function handleProgress(audio: HTMLAudioElement): void {
		const { duration, currentTime } = audio;

		setProgress({ currentTime });

		if (isSeekingRef.current === false)
			setProgress({ percentage: (currentTime / duration) * 100 });
	}

	const media = mainList.get(path);

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
		<Wrapper aria-label="Media player" title="Media player">
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
		</Wrapper>
	);
}

/////////////////////////////////////////
// Helper functions:

const Player = ({ media, audio, path, isSeeking }: PlayerProps) => (
	<>
		<Header media={media} path={path} />

		<SquareImage>
			<div>
				<ImgWithFallback
					Fallback={<MusicNote size={13} />}
					mediaImg={media?.image}
					mediaPath={path}
				/>
			</div>
		</SquareImage>

		<Info>
			<span id="title">{media?.title}</span>
			<span id="subtitle">{media?.artist}</span>
		</Info>

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
			newPath: "",
			path,
		});

	// Maybe set audio currentTime to last played time:
	const lastTime = getCurrentPlaying().currentTime;
	if (lastTime > 30 /* seconds */) {
		dbg(
			`Audio has loaded metadata. Setting currentTime to ${lastTime} seconds.`,
		);
		audio.currentTime = lastTime;
	}
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
