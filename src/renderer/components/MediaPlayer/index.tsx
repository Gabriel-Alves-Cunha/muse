import type { Media, Path } from "@common/@types/generalTypes";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef } from "react";
import create from "zustand";

import { ControlsAndSeeker, Header } from "./helpers";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { formatDuration } from "@common/utils";
import { FlipCard } from "@components/FlipCard";
import { Lyrics } from "./Lyrics";
import { dbg } from "@common/utils";
import {
	PlaylistActions,
	setPlaylists,
	usePlaylists,
	WhatToDo,
} from "@contexts/mediaHandler/usePlaylists";
import {
	useCurrentPlaying,
	currentPlaying,
	playNextMedia,
} from "@contexts/mediaHandler/useCurrentPlaying";

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

const mainListSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.sortedByName;

const currentPlayingPathSelector = (
	state: ReturnType<typeof useCurrentPlaying.getState>,
) => state.path;

export function MediaPlayer() {
	const path = useCurrentPlaying(currentPlayingPathSelector) ?? "";
	const audioRef = useRef<HTMLAudioElement>(null);
	const mainList = usePlaylists(mainListSelector);

	const media = mainList.get(path);
	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

		const lambdaHandleLoadedData = () => handleLoadedData(audio, path, media);
		const lambdaHandleAudioCanPlay = () => handleAudioCanPlay(audio);
		const lambdaHandleProgress = () => handleProgress(audio);
		const lambdaHandleEnded = () => handleEnded(audio);

		// Adding event listeners:
		audio.addEventListener("loadeddata", lambdaHandleLoadedData);
		audio.addEventListener("canplay", lambdaHandleAudioCanPlay);
		audio.addEventListener("timeupdate", lambdaHandleProgress);
		audio.addEventListener("ended", lambdaHandleEnded);
		audio.addEventListener("invalid", handleInvalid);
		audio.addEventListener("stalled", handleStalled);
		audio.addEventListener("ended", playNextMedia);
		audio.addEventListener("error", handleError);
		audio.addEventListener("abort", handleAbort);
		audio.addEventListener("close", handleClose);
		audio.addEventListener(
			"securitypolicyviolation",
			handleSecurityPolicyViolation,
		);

		return () => {
			audio.removeEventListener("loadeddata", lambdaHandleLoadedData);
			audio.removeEventListener("canplay", lambdaHandleAudioCanPlay);
			audio.removeEventListener("timeupdate", lambdaHandleProgress);
			audio.removeEventListener("ended", lambdaHandleEnded);
			audio.removeEventListener("invalid", handleInvalid);
			audio.removeEventListener("stalled", handleStalled);
			audio.removeEventListener("ended", playNextMedia);
			audio.removeEventListener("error", handleError);
			audio.removeEventListener("abort", handleAbort);
			audio.removeEventListener("close", handleClose);
			audio.removeEventListener(
				"securitypolicyviolation",
				handleSecurityPolicyViolation,
			);
		};
	}, [audio, media, path]);

	return (
		<Wrapper aria-label="Media player">
			<FlipCard
				cardFront={
					<Player media={media} audioRef={audioRef} audio={audio} path={path} />
				}
				cardBack={<Lyrics media={media} path={path} />}
			/>
		</Wrapper>
	);
}

/////////////////////////////////////////
// Helper functions:

const Player = ({ media, audioRef, audio, path }: PlayerProps) => (
	<>
		<>
			<audio id="audio" preload="metadata" ref={audioRef} />
		</>

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

		<ControlsAndSeeker audio={audio} />
	</>
);

/////////////////////////////////////////

const handleInvalid = (e: Readonly<Event>): void => dbg("Audio is invalid.", e);
const handleAbort = (): void => dbg("Audio was aborted.");
const handleClose = (): void => dbg("Audio was closed.");
const handleSecurityPolicyViolation = (e: Readonly<Event>): void =>
	console.error("Audio has a security policy violation:", e);
const handleError = (e: Readonly<Event>): void =>
	console.error("Audio error:", e);
const handleStalled = (e: Readonly<Event>): void =>
	dbg(
		"Audio is stalled (Fires when the browser is trying to get media data, but it is not available):",
		e,
	);

/////////////////////////////////////////

function handleProgress(audio: Audio): void {
	if (!audio) return;

	const { duration, currentTime } = audio;
	const percentage = (currentTime / duration) * 100;

	setProgress({ currentTime, percentage });
}

/////////////////////////////////////////

function handleLoadedData(
	audio: Audio,
	path: Path,
	media: Media | undefined,
): void {
	if (!media || !path || !audio) return;

	const formatedDuration = formatDuration(audio.duration);
	if (formatedDuration !== media.duration) {
		// Updating the duration of media:
		setPlaylists({
			newMedia: { ...media, duration: formatedDuration },
			whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			path,
		});
	}

	// Maybe set audio currentTime to last played time:
	const lastTime = currentPlaying().currentTime;
	if (lastTime > 30 /* seconds */) {
		dbg(
			`Audio has loaded metadata. Setting currentTime to ${lastTime} seconds.`,
		);
		audio.currentTime = lastTime;
	}
}

/////////////////////////////////////////

function handleEnded(audio: Audio): void {
	if (!audio) return;

	dbg(
		`Audio ended, playing ${
			audio.loop ?
				"again because it's on loop." :
				"next media."
		}`,
	);

	if (!audio.loop) playNextMedia();
}

/////////////////////////////////////////

async function handleAudioCanPlay(audio: Audio): Promise<void> {
	if (!audio) return;

	dbg("Audio can play.");
	await audio.play();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Progress = Readonly<{ currentTime: number; percentage: number; }>;

/////////////////////////////////////////

type Audio = HTMLAudioElement | null;

/////////////////////////////////////////

type PlayerProps = Readonly<
	{
		audioRef: React.RefObject<HTMLAudioElement>;
		audio: HTMLAudioElement | null;
		media: Media | undefined;
		path: Path;
	}
>;
