import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef } from "react";
import create from "zustand";

import { ControlsAndSeeker, Header } from "./helpers";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { formatDuration } from "@common/utils";
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

export function MediaPlayer() {
	const { sortedByName: mainList } = usePlaylists();
	const audioRef = useRef<HTMLAudioElement>(null);
	const path = useCurrentPlaying().path ?? "";

	const media = mainList.get(path);
	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

		function handleProgress(): void {
			if (!audio) return;

			const { duration, currentTime } = audio;
			const percentage = (currentTime / duration) * 100;

			setProgress({ currentTime, percentage });
		}

		function handleLoadedData(): void {
			if (!media || !path || !audio) return;

			// Updating the duration of media:
			setPlaylists({
				newMedia: { ...media, duration: formatDuration(audio.duration) },
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				path,
			});

			const lastTime = currentPlaying().currentTime;
			if (lastTime > 30 /* seconds */) {
				dbg(
					`Audio has loaded metadata. Setting currentTime to ${lastTime} seconds.`,
				);
				audio.currentTime = lastTime;
			}
		}

		function handleEnded(): void {
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

		async function handleAudioCanPlay(): Promise<void> {
			if (!audio) return;

			dbg("Audio can play.");

			await audio.play();
		}

		// Adding event listeners:
		audio.addEventListener("loadeddata", handleLoadedData);
		audio.addEventListener("canplay", handleAudioCanPlay);
		audio.addEventListener("timeupdate", handleProgress);
		audio.addEventListener("invalid", handleInvalid);
		audio.addEventListener("stalled", handleStalled);
		audio.addEventListener("ended", playNextMedia);
		audio.addEventListener("error", handleError);
		audio.addEventListener("abort", handleAbort);
		audio.addEventListener("close", handleClose);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener(
			"securitypolicyviolation",
			handleSecurityPolicyViolation,
		);

		return () => {
			audio.removeEventListener("loadeddata", handleLoadedData);
			audio.removeEventListener("canplay", handleAudioCanPlay);
			audio.removeEventListener("timeupdate", handleProgress);
			audio.removeEventListener("invalid", handleInvalid);
			audio.removeEventListener("stalled", handleStalled);
			audio.removeEventListener("ended", playNextMedia);
			audio.removeEventListener("error", handleError);
			audio.removeEventListener("abort", handleAbort);
			audio.removeEventListener("close", handleClose);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener(
				"securitypolicyviolation",
				handleSecurityPolicyViolation,
			);
		};
	}, [audio, media, path]);

	return (
		<Wrapper aria-label="Media player">
			<>
				<audio id="audio" preload="metadata" ref={audioRef} />
			</>

			<Header media={media} path={path} />

			<SquareImage>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaImg={media?.img}
						mediaPath={path}
					/>
				</div>
			</SquareImage>

			<Info>
				<span id="title">{media?.title}</span>
				<span id="subtitle">{media?.artist}</span>
			</Info>

			<ControlsAndSeeker audio={audio} />
		</Wrapper>
	);
}

/////////////////////////////////////////
// Helper functions:

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
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Progress = Readonly<{ currentTime: number; percentage: number; }>;
