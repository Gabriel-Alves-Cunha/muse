import { useEffect, useState } from "react";
import {
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";
import {
	IoPlayBackSharp as Previous,
	IoPlayForwardSharp as Next,
	IoPauseSharp as Pause,
	IoPlaySharp as Play,
} from "react-icons/io5";

import { CircleIconButton } from "@components/CircleIconButton";
import { SeekerWrapper } from "./Seeker";
import { t } from "@components/I18n";
import {
	toggleLoopMedia,
	usePlayOptions,
	toggleRandom,
} from "@contexts/usePlayOptions";
import {
	playPreviousMedia,
	togglePlayPause,
	playNextMedia,
} from "@contexts/useCurrentPlaying";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function ControlsAndSeeker({ audio, isSeeking }: RefToAudioAndSeeker) {
	const { random: isRandom, loop: loopThisMedia } = usePlayOptions();

	const isThereAMedia = !(audio !== null && audio.src.length > 0);

	return (
		<div className="absolute flex flex-col bottom-10 w-full">
			<SeekerWrapper audio={audio} isSeeking={isSeeking} />

			<div className="flex justify-between items-center mt-[10%]">
				<CircleIconButton
					aria-label={t("tooltips.toggleLoopThisMedia")}
					title={t("tooltips.toggleLoopThisMedia")}
					onPointerUp={toggleLoopMedia}
					disabled={isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <Repeat size="18" />}
				</CircleIconButton>

				<Controls audio={audio} isDisabled={isThereAMedia} />

				<CircleIconButton
					aria-label={t("tooltips.toggleRandom")}
					title={t("tooltips.toggleRandom")}
					onPointerUp={toggleRandom}
					disabled={isThereAMedia}
				>
					{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
				</CircleIconButton>
			</div>
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

function PlayPauseButton({ isDisabled, audio }: ControlsProps) {
	const [isPaused, setIsPaused] = useState(true);

	const setIsPausedToFalse = () => setIsPaused(false);
	const setIsPausedToTrue = () => setIsPaused(true);

	useEffect(() => {
		if (audio === null) return;

		audio.addEventListener("pause", setIsPausedToTrue);
		audio.addEventListener("play", setIsPausedToFalse);

		return () => {
			audio.removeEventListener("pause", setIsPausedToTrue);
			audio.removeEventListener("play", setIsPausedToFalse);
		};
	}, [audio]);

	return (
		<CircleIconButton
			title={t("tooltips.playPause")}
			onPointerUp={togglePlayPause}
			disabled={isDisabled}
			variant="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</CircleIconButton>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Controls = ({ isDisabled, audio }: ControlsProps) => (
	<div className="relative flex justify-center items-center w-[120px]">
		<CircleIconButton
			aria-label={t("tooltips.playPreviousTrack")}
			title={t("tooltips.playPreviousTrack")}
			onPointerUp={playPreviousMedia}
			disabled={isDisabled}
		>
			<Previous />
		</CircleIconButton>

		<PlayPauseButton isDisabled={isDisabled} audio={audio} />

		<CircleIconButton
			aria-label={t("tooltips.playNextTrack")}
			title={t("tooltips.playNextTrack")}
			onPointerUp={playNextMedia}
			disabled={isDisabled}
		>
			<Next />
		</CircleIconButton>
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type ControlsProps = Readonly<{ isDisabled: boolean; audio: Audio }>;

/////////////////////////////////////////

export type RefToAudioAndSeeker = Readonly<{
	audio: Audio;
	isSeeking: React.MutableRefObject<boolean>;
}>;

/////////////////////////////////////////

export type Audio = HTMLAudioElement | null;
