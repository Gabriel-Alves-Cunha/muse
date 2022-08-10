import { type MutableRefObject, useEffect, useState } from "react";
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

import {
	ControlsAndSeekerContainer,
	ControlsButtonsWrapper,
	CircledIconButton,
	ControlsWrapper,
} from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function ControlsAndSeeker({ audio, isSeeking }: RefToAudioAndSeeker) {
	const { random: isRandom, loop: loopThisMedia } = usePlayOptions();

	const isThereAMedia = !(audio !== null && audio.src.length > 0);

	return (
		<ControlsAndSeekerContainer>
			<SeekerWrapper audio={audio} isSeeking={isSeeking} />

			<ControlsButtonsWrapper>
				<CircledIconButton
					data-tip={t("tooltips.toggleLoopThisMedia")}
					onClick={toggleLoopMedia}
					disabled={isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <Repeat size="18" />}
				</CircledIconButton>

				<Controls audio={audio} isDisabled={isThereAMedia} />

				<CircledIconButton
					data-tip={t("tooltips.toggleRandom")}
					disabled={isThereAMedia}
					onClick={toggleRandom}
				>
					{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
				</CircledIconButton>
			</ControlsButtonsWrapper>
		</ControlsAndSeekerContainer>
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
		<CircledIconButton
			data-tip={t("tooltips.playPause")}
			onClick={togglePlayPause}
			disabled={isDisabled}
			size="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</CircledIconButton>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Controls = ({ isDisabled, audio }: ControlsProps) => (
	<ControlsWrapper>
		<CircledIconButton
			data-tip={t("tooltips.playPreviousTrack")}
			onClick={playPreviousMedia}
			disabled={isDisabled}
		>
			<Previous />
		</CircledIconButton>

		<PlayPauseButton isDisabled={isDisabled} audio={audio} />

		<CircledIconButton
			data-tip={t("tooltips.playNextTrack")}
			onClick={playNextMedia}
			disabled={isDisabled}
		>
			<Next />
		</CircledIconButton>
	</ControlsWrapper>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type ControlsProps = Readonly<{ isDisabled: boolean; audio: Audio; }>;

/////////////////////////////////////////

export type RefToAudioAndSeeker = Readonly<
	{ audio: Audio; isSeeking: MutableRefObject<boolean>; }
>;

/////////////////////////////////////////

export type Audio = HTMLAudioElement | null;
