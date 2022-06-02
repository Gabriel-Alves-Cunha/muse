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

export const useProgress = create<Progress>(() => ({
	currentTime: 0,
	percentage: 0,
}));
const { setState: setProgress } = useProgress;

export function MediaPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const { sortedByName: mainList } = usePlaylists();
	const { path } = useCurrentPlaying();

	const media = mainList.get(path ?? "");
	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

		const handleProgress = () => {
			const { duration, currentTime } = audio;
			const percentage = (currentTime / duration) * 100;

			setProgress({ currentTime, percentage });
		};

		const handleLoadedData = () => {
			if (!media || !path) return;

			// Updating the duration of media:
			setPlaylists({
				newMedia: { ...media, duration: formatDuration(audio.duration) },
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				path,
			});

			const lastTime = currentPlaying().currentTime;
			if (lastTime > 30 /* seconds */) {
				console.log(
					`Audio has loaded metadata. Setting currentTime to ${lastTime} seconds.`,
				);
				audio.currentTime = lastTime;
			}
		};

		const handleEnded = () => {
			dbg(
				`Audio ended, playing ${
					audio.loop ? "again because it's on loop." : "next media."
				}`,
			);

			if (audio.loop) playNextMedia();
		};

		const handleAudioCanPlay = async () => {
			dbg("Audio can play.");
			await audio.play();
		};

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
		<Wrapper>
			<>
				<audio id="audio" preload="metadata" ref={audioRef} />
			</>

			<Header media={media} path={path ?? ""} />

			<SquareImage>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaPath={path ?? ""}
						mediaImg={media?.img}
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

const handleInvalid = (e: Event) => dbg("Audio is invalid.", e);
const handleError = (e: Event) => dbg("Audio error:", e);
const handleAbort = () => dbg("Audio was aborted.");
const handleClose = () => dbg("Audio was closed.");
const handleSecurityPolicyViolation = (e: Event) =>
	console.error("Audio has a security policy violation:", e);
const handleStalled = (e: Event) =>
	dbg(
		"Audio is stalled (Fires when the browser is trying to get media data, but it is not available):",
		e,
	);

type Progress = Readonly<{
	currentTime: number;
	percentage: number;
}>;
