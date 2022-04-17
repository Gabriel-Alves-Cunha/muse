import type { Media } from "@common/@types/typesAndEnums";

import { BiDotsVerticalRounded as Dots } from "react-icons/bi";
import {
	IoPlayBackSharp as Previous,
	IoPlayForwardSharp as Next,
	IoPauseSharp as Pause,
	IoPlaySharp as Play,
} from "react-icons/io5";
import {
	MdFavoriteBorder as AddFavorite,
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdFavorite as Favorite,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";

import { useCallback, useMemo, useRef } from "react";

import { formatDuration } from "@common/utils";
import { useProgress } from ".";
import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlayOptionsType,
	usePlayOptions,
} from "@contexts";

import {
	ControlsAndSeekerContainer,
	ControlsButtonsWrapper,
	ControlsWrapper,
	OptionsAndAlbum,
	ProgressWrapper,
	SeekerContainer,
	ProgressThumb,
	IconButton,
	Album,
} from "./styles";

const { ceil } = Math;

const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlayOptions } = usePlayOptions;

const toggleRepeatThisMedia = () =>
	getPlayOptions().setPlayOptions({
		value: getPlayOptions().playOptions.loopThisMedia ? false : true,
		type: PlayOptionsType.LOOP_THIS_MEDIA,
	});

const toggleRandomAndLoop = () =>
	getPlayOptions().setPlayOptions({
		value: getPlayOptions().playOptions.isRandom ? false : true,
		type: PlayOptionsType.IS_RANDOM,
	});

const togglePlayOrPauseMedia = () =>
	getCurrentPlaying().setCurrentPlaying({
		type: CurrentPlayingEnum.TOGGLE_PLAY_PAUSE,
	});

const playPreviousMedia = () =>
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getCurrentPlaying().currentPlaying.playlistName,
		type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
	});

export const playNextMedia = () =>
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getCurrentPlaying().currentPlaying.playlistName,
		type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
	});

export const ControlsAndSeeker = ({ audio }: RefToAudio) => {
	const { isRandom, loopThisMedia } = usePlayOptions().playOptions;

	return (
		<ControlsAndSeekerContainer>
			<SeekerWrapper audio={audio} />

			<ControlsButtonsWrapper>
				<IconButton onClick={toggleRepeatThisMedia} style={{ width: 40 }}>
					{loopThisMedia ? <Repeat size="18" /> : <RepeatOne size="18" />}
				</IconButton>

				<Controls isPaused={audio?.paused} />

				<IconButton onClick={toggleRandomAndLoop} style={{ width: 40 }}>
					{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
				</IconButton>
			</ControlsButtonsWrapper>
		</ControlsAndSeekerContainer>
	);
};

export const Header = ({ media }: RefToMedia) => (
	<OptionsAndAlbum>
		<IconButton style={{ width: 30 }}>
			<Dots size="19" />
		</IconButton>

		<Album>{media?.album}</Album>

		<IconButton style={{ width: 30 }}>
			{media?.favorite ? <Favorite size="17" /> : <AddFavorite size="17" />}
		</IconButton>
	</OptionsAndAlbum>
);

export const Controls = ({ isPaused = false }: IsPaused) => (
	<ControlsWrapper>
		<IconButton
			className="previous-or-next"
			onClick={playPreviousMedia}
			style={{ width: 30 }}
		>
			<Previous />
		</IconButton>

		<IconButton
			onClick={togglePlayOrPauseMedia}
			style={{ width: 50 }}
			id="play-pause"
		>
			{isPaused ? <Play size="25" /> : <Pause size="25" />}
		</IconButton>

		<IconButton
			className="previous-or-next"
			onClick={playNextMedia}
			style={{ width: 30 }}
		>
			<Next />
		</IconButton>
	</ControlsWrapper>
);

const seek = (e: SeekEvent, audio: Audio) => {
	if (!audio || !audio.duration) return;
	const duration = audio.duration;

	const width = Number(
		getComputedStyle(e.currentTarget).width.replace("px", ""),
	);
	const clickX = e.nativeEvent.offsetX;
	const desiredTime = (clickX / width) * duration;

	audio.currentTime = desiredTime;
};

const { isNaN } = Number;

export function SeekerWrapper({ audio }: RefToAudio) {
	const progressWrapperRef = useRef<HTMLDivElement>(null);
	const timeTooltipRef = useRef<HTMLSpanElement>(null);
	const { percentage, currentTime } = useProgress();
	const duration = audio?.duration;

	const { formatedDuration, isDurationValid } = useMemo(
		() => ({
			isDurationValid:
				typeof duration === "number" && !isNaN(duration) && duration > 0,
			formatedDuration: formatDuration(duration),
		}),
		[duration],
	);

	const handleTooltip = useCallback(
		({ nativeEvent: { offsetX: mouseX } }: SeekEvent) => {
			/*
				- event.offsetX, event.offsetY
					The X and Y coordinates of the mouse relative
					to the event source element (srcElement).
			*/
			if (!isDurationValid) return;
			const tooltip = timeTooltipRef.current;
			const div = progressWrapperRef.current;
			if (!div || !tooltip) return;

			const { width } = div.getBoundingClientRect();
			const progressBarWidth = ceil(width);

			const mouseXPercentage = (mouseX / progressBarWidth) * 100;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const time = (mouseXPercentage / 100) * duration!;
			const left = mouseX - (35 >> 1); // 35 is the width of the tooltip.
			// Also, (35 >> 1) is the half of the width (binary divide by 2).

			tooltip.textContent = formatDuration(time);
			tooltip.style.left = `${left}px`;
		},
		[duration, isDurationValid],
	);

	return (
		<SeekerContainer>
			<span>{formatDuration(currentTime)}</span>

			<ProgressWrapper
				style={{ cursor: isDurationValid ? "pointer" : "default" }}
				onClick={e => seek(e, audio)}
				onMouseMove={handleTooltip}
				ref={progressWrapperRef}
			>
				<span
					style={isDurationValid ? {} : { display: "none" }}
					ref={timeTooltipRef}
				/>

				<ProgressThumb
					style={{
						width: `${percentage}%`,
					}}
				></ProgressThumb>
			</ProgressWrapper>

			<span>{formatedDuration}</span>
		</SeekerContainer>
	);
}

type Audio = HTMLAudioElement | null;
type RefToAudio = Readonly<{ audio: Audio }>;
type RefToMedia = Readonly<{ media: Media | undefined }>;
type IsPaused = Readonly<{ isPaused: boolean | undefined }>;
type SeekEvent = React.MouseEvent<HTMLDivElement, MouseEvent>;
