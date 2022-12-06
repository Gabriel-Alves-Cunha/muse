import type { Media, Path } from "@common/@types/generalTypes";

import {
	type Component,
	type Accessor,
	type Setter,
	createEffect,
	createSignal,
	onMount,
} from "solid-js";

import { currentPlaying, playNextMedia } from "@contexts/useCurrentPlaying";
import { FlipCard, mediaPlayerCardId } from "../FlipCard";
import { refreshMedia, playlists } from "@contexts/usePlaylists";
import { ControlsAndSeeker } from "./Controls";
import { ImgWithFallback } from "../ImgWithFallback";
import { formatDuration } from "@common/utils";
import { MusicNoteIcon } from "@icons/MusicNoteIcon";
import { emptyString } from "@common/empty";
import { log, error } from "@utils/log";
import { Header } from "./Header";
import { Lyrics } from "./Lyrics";
import { dbg } from "@common/debug";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Helper constants:

export const [getProgress, setProgress] = createSignal({
	currentTime: 0,
	percentage: 0,
});

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Main function:

export const MediaPlayer: Component = () => {
	const mainList = playlists().sortedByNameAndMainList;
	const [isSeeking, setIsSeeking] = createSignal(false);
	const { path } = currentPlaying();
	let audio: HTMLAudioElement | undefined;

	const media = () => mainList.get(path);

	const handleProgress = (audio: HTMLAudioElement): void => {
		const { duration, currentTime } = audio;

		setProgress((prev) => ({ ...prev, currentTime }));

		if (!isSeeking())
			setProgress((prev) => ({
				...prev,
				percentage: (currentTime / duration) * 100,
			}));
	};

	createEffect(() => {
		log("flipMediaPlayerCardToNormalPlayer", audio?.src);

		document.getElementById(mediaPlayerCardId)?.classList.remove("active");
	});

	onMount(() => {
		const lambdaHandleLoadedData = () =>
			handleLoadedData(audio!, path, media());
		const lambdaHandleAudioCanPlay = () => handleAudioCanPlay(audio!);
		const lambdaHandleProgress = () => handleProgress(audio!);
		const lambdaHandleEnded = () => handleEnded(audio!);

		// Adding event listeners:
		audio!.addEventListener("loadeddata", lambdaHandleLoadedData);
		audio!.addEventListener("canplay", lambdaHandleAudioCanPlay);
		audio!.addEventListener("timeupdate", lambdaHandleProgress);
		audio!.addEventListener("ended", lambdaHandleEnded);
		audio!.addEventListener("invalid", logInvalid);
		audio!.addEventListener("stalled", logStalled);
		audio!.addEventListener("ended", playNextMedia);
		audio!.addEventListener("error", logError);
		audio!.addEventListener("abort", logAbort);
		audio!.addEventListener("close", logClose);
		audio!.addEventListener(
			"securitypolicyviolation",
			logSecurityPolicyViolation,
		);
	});

	return (
		<aside class="aside">
			<audio id="audio" ref={audio as HTMLAudioElement} />

			<FlipCard
				cardBack={<Lyrics media={media()} path={path} />}
				cardFront={
					<Player
						setIsSeeking={setIsSeeking}
						isSeeking={isSeeking}
						media={media()}
						audio={audio}
						path={path}
					/>
				}
			/>
		</aside>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const Player: Component<PlayerProps> = (props) => (
	<>
		<Header media={props.media} path={props.path} />

		<div class="aspect-square rounded-2xl flex items-center justify-center w-full shadow-reflect mt-[25%]">
			<ImgWithFallback
				Fallback={<MusicNoteIcon class="w-7 h-7" />}
				mediaImg={props.media?.image}
				mediaPath={props.path}
			/>
		</div>

		<div class="flex flex-col justify-center items-center h-[10vh] w-full mt-[3vh]">
			<span
				class="flex justify-center items-center w-full text-icon-media-player flex-wrap font-secondary tracking-wide text-center overflow-y-hidden text-xl font-medium"
				id="title"
			>
				{props.media?.title}
			</span>

			<span
				class="flex justify-center items-center w-full text-icon-media-player flex-wrap font-secondary tracking-wide text-center overflow-y-hidden text-sm font-normal"
				id="subtitle"
			>
				{props.media?.artist}
			</span>
		</div>

		<ControlsAndSeeker
			setIsSeeking={props.setIsSeeking}
			isSeeking={props.isSeeking}
			audio={props.audio}
		/>
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
	path: Path,
	media: Media | undefined,
): void => {
	if (!media) return;

	const formatedDuration = formatDuration(audio.duration);

	// Updating the duration of media:
	if (formatedDuration !== media.duration)
		refreshMedia(path, emptyString, { ...media, duration: formatedDuration });

	// Maybe set audio.currentTime to last stopped time:
	const lastTime = currentPlaying().currentTime;
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
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Progress = { currentTime: number; percentage: number };

/////////////////////////////////////////

type PlayerProps = {
	audio: HTMLAudioElement | undefined;
	setIsSeeking: Setter<boolean>;
	isSeeking: Accessor<boolean>;
	media: Media | undefined;
	path: Path;
};
