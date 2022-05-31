import type { Media, Path } from "@common/@types/generalTypes";

import { BiDotsVerticalRounded as Dots } from "react-icons/bi";
import { useCallback, useMemo, useRef } from "react";
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

import { formatDuration } from "@common/utils";
import { TooltipButton } from "@components/TooltipButton";
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
				<TooltipButton
					tooltip="Toggle loop this media"
					onClick={toggleLoopMedia}
					className="icon-button"
				>
					{loopThisMedia ? <Repeat size="18" /> : <RepeatOne size="18" />}
				</TooltipButton>

				<Controls isPaused={audio?.paused} />

				<TooltipButton
					className="icon-button"
					tooltip="Toggle random"
					onClick={toggleRandom}
				>
					{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
				</TooltipButton>
			</ControlsButtonsWrapper>
		</ControlsAndSeekerContainer>
	);
};

export const Header = ({ media, path }: RefToMedia) => (
	<OptionsAndAlbum>
		<TooltipButton tooltip="Media options" className="icon-button">
			<Dots size={20} />
		</TooltipButton>

		<Album>{media?.album}</Album>

		<TooltipButton
			onClick={() => toggleFavorite(path)}
			tooltip-side="left-bottom"
			tooltip="Toggle favorite"
			className="icon-button"
		>
			{favorites().has(path) ? (
				<Favorite size={17} />
			) : (
				<AddFavorite size={17} />
			)}
		</TooltipButton>
	</OptionsAndAlbum>
);

export const Controls = ({ isPaused = false }: IsPaused) => (
	<ControlsWrapper>
		<TooltipButton
			className="previous-or-next icon-button"
			style={{ width: 29, height: 29, lineHeight: 29 }}
			tooltip="Play previous track"
			onClick={playPreviousMedia}
		>
			<Previous />
		</TooltipButton>

		<TooltipButton
			style={{ width: 49, height: 49, lineHeight: 49 }}
			onClick={togglePlayPause}
			className="icon-button"
			tooltip="Play/pause"
			tooltip-side="top"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</TooltipButton>

		<TooltipButton
			className="previous-or-next icon-button"
			style={{ width: 29, height: 29, lineHeight: 29 }}
			tooltip="Play next track"
			onClick={playNextMedia}
		>
			<Next />
		</TooltipButton>
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
