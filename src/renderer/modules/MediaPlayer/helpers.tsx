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
import { useProgress } from ".";
import { Tooltip } from "@components/Tooltip";
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
	IconButton,
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
	const { isRandom, loopThisMedia } = usePlayOptions();

	return (
		<ControlsAndSeekerContainer>
			<SeekerWrapper audio={audio} />

			<ControlsButtonsWrapper>
				<Tooltip text="Toggle loop this media">
					<IconButton onClick={toggleLoopMedia} style={{ width: 40 }}>
						{loopThisMedia ? <Repeat size="18" /> : <RepeatOne size="18" />}
					</IconButton>
				</Tooltip>

				<Controls isPaused={audio?.paused} />

				<Tooltip text="Toggle random">
					<IconButton onClick={toggleRandom} style={{ width: 40 }}>
						{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
					</IconButton>
				</Tooltip>
			</ControlsButtonsWrapper>
		</ControlsAndSeekerContainer>
	);
};

export const Header = ({ media, path }: RefToMedia) => (
	<OptionsAndAlbum>
		<Tooltip text="Media options">
			<IconButton style={{ width: 30 }}>
				<Dots size={20} />
			</IconButton>
		</Tooltip>

		<Album>{media?.album}</Album>

		<Tooltip text="Toggle favorite">
			<IconButton onClick={() => toggleFavorite(path)} style={{ width: 30 }}>
				{favorites().has(path) ? (
					<Favorite size={17} />
				) : (
					<AddFavorite size={17} />
				)}
			</IconButton>
		</Tooltip>
	</OptionsAndAlbum>
);

export const Controls = ({ isPaused = false }: IsPaused) => (
	<ControlsWrapper>
		<Tooltip text="Play previous track">
			<IconButton
				className="previous-or-next"
				onClick={playPreviousMedia}
				style={{ width: 29 }}
			>
				<Previous />
			</IconButton>
		</Tooltip>

		<Tooltip text="Play/pause">
			<IconButton
				onClick={togglePlayPause}
				style={{ width: 49 }}
				id="play-pause"
			>
				{isPaused ? <Play size={25} /> : <Pause size={25} />}
			</IconButton>
		</Tooltip>

		<Tooltip text="Play next track">
			<IconButton
				className="previous-or-next"
				onClick={playNextMedia}
				style={{ width: 29 }}
			>
				<Next />
			</IconButton>
		</Tooltip>
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
					style={{ width: `${isNaN(percentage) ? 0 : percentage}%` }}
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
