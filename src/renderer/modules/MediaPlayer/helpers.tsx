import type { Media, Path } from "@common/@types/generalTypes";

import { BiDotsVerticalRounded as Dots } from "react-icons/bi";
import { useCallback, useMemo, useRef } from "react";
import {
	MdFavoriteBorder as AddFavorite,
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdFavorite as Favorite,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";
import {
	IoPlayBackSharp as Previous,
	IoPlayForwardSharp as Next,
	IoPauseSharp as Pause,
	IoPlaySharp as Play,
} from "react-icons/io5";

import { formatDuration } from "@common/utils";
import { useProgress } from ".";
import {
	toggleLoopMedia,
	usePlayOptions,
	toggleRandom,
} from "@contexts/mediaHandler/usePlayOptions";
import {
	playPreviousMedia,
	togglePlayPause,
	playNextMedia,
} from "@contexts/mediaHandler/useCurrentPlaying";
import {
	PlaylistActions,
	setPlaylists,
	favorites,
	WhatToDo,
} from "@contexts/mediaHandler/usePlaylists";

import {
	ControlsAndSeekerContainer,
	TooltipCircleIconButton,
	ControlsButtonsWrapper,
	ControlsWrapper,
	OptionsAndAlbum,
	ProgressWrapper,
	SeekerContainer,
	ProgressThumb,
	Duration,
	Album,
} from "./styles";

const toggleFavorite = (path?: Path) =>
	path &&
	setPlaylists({
		whatToDo: PlaylistActions.TOGGLE_ONE_MEDIA,
		type: WhatToDo.UPDATE_FAVORITES,
		path,
	});

export const ControlsAndSeeker = ({ audio }: RefToAudio) => {
	const { random: isRandom, loop: loopThisMedia } = usePlayOptions();

	return (
		<ControlsAndSeekerContainer>
			<SeekerWrapper audio={audio} />

			<ControlsButtonsWrapper>
				<TooltipCircleIconButton
					data-tooltip="Toggle loop this media"
					onClick={toggleLoopMedia}
				>
					{loopThisMedia ? <Repeat size="18" /> : <RepeatOne size="18" />}
				</TooltipCircleIconButton>

				<Controls isPaused={audio?.paused} />

				<TooltipCircleIconButton
					data-tooltip="Toggle random"
					tooltip-side="left-bottom"
					onClick={toggleRandom}
				>
					{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
				</TooltipCircleIconButton>
			</ControlsButtonsWrapper>
		</ControlsAndSeekerContainer>
	);
};

export const Header = ({ media, path }: RefToMedia) => (
	<OptionsAndAlbum>
		<TooltipCircleIconButton data-tooltip="Media options">
			<Dots size={20} />
		</TooltipCircleIconButton>

		<Album>{media?.album}</Album>

		<TooltipCircleIconButton
			onClick={() => toggleFavorite(path)}
			data-tooltip="Toggle favorite"
			tooltip-side="left-bottom"
		>
			{favorites().has(path) ? (
				<Favorite size={17} />
			) : (
				<AddFavorite size={17} />
			)}
		</TooltipCircleIconButton>
	</OptionsAndAlbum>
);

export const Controls = ({ isPaused = false }: IsPaused) => (
	<ControlsWrapper>
		<TooltipCircleIconButton
			data-tooltip="Play previous track"
			onClick={playPreviousMedia}
			tooltip-side="top"
		>
			<Previous />
		</TooltipCircleIconButton>

		<TooltipCircleIconButton
			onClick={togglePlayPause}
			data-tooltip="Play/pause"
			tooltip-side="top"
			size="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</TooltipCircleIconButton>

		<TooltipCircleIconButton
			data-tooltip="Play next track"
			onClick={playNextMedia}
			tooltip-side="top"
		>
			<Next />
		</TooltipCircleIconButton>
	</ControlsWrapper>
);

const seek = (e: SeekEvent, audio: Audio) => {
	if (!audio || !audio.duration) return;

	const width = Number(
		getComputedStyle(e.currentTarget).width.replace("px", ""),
	);
	const clickX = e.nativeEvent.offsetX;
	const desiredTime = (clickX / width) * audio.duration;

	audio.currentTime = desiredTime;
};

const { isNaN } = Number;
const { floor } = Math;

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
			const progressBarWidth = floor(width);

			mouseX = mouseX < 0 ? 0 : mouseX;
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
			<ProgressWrapper
				css={{ cursor: isDurationValid ? "pointer" : "default" }}
				onClick={e => seek(e, audio)}
				onMouseMove={handleTooltip}
				ref={progressWrapperRef}
			>
				<span
					style={isDurationValid ? {} : { display: "none" }}
					ref={timeTooltipRef}
				/>

				<ProgressThumb
					css={{ width: `${isNaN(percentage) ? 0 : percentage}%` }}
				/>
			</ProgressWrapper>

			<Duration>
				<p>{formatDuration(currentTime)}</p>

				<p>{formatedDuration}</p>
			</Duration>
		</SeekerContainer>
	);
}

type Audio = HTMLAudioElement | null;
type RefToAudio = Readonly<{ audio: Audio }>;
type IsPaused = Readonly<{ isPaused: boolean | undefined }>;
type SeekEvent = React.MouseEvent<HTMLDivElement, MouseEvent>;
type RefToMedia = Readonly<{ media: Media | undefined; path: Path }>;
