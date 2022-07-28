import type { Media, Path } from "@common/@types/generalTypes";

// import { BsJournalText as LyricsPresent } from "react-icons/bs";
// import { BsJournal as NoLyrics } from "react-icons/bs";
import { BsFillFileTextFill as LyricsPresent } from "react-icons/bs";
import { useCallback, useMemo, useRef } from "react";
import { BsFileText as NoLyrics } from "react-icons/bs";
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

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { flipMediaPlayerCard } from "@components/FlipCard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { formatDuration } from "@common/utils";
import { useProgress } from ".";
import { infoToast } from "@styles/global";
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
	CircledIconButton,
	ControlsWrapper,
	OptionsAndAlbum,
	ProgressWrapper,
	SeekerContainer,
	ProgressThumb,
	Duration,
	Album,
} from "./styles";

const { searchForLyricsAndImage } = electron.lyric;
const { floor } = Math;

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

function toggleFavorite(path?: Readonly<Path>): void {
	if (path)
		setPlaylists({
			whatToDo: PlaylistActions.TOGGLE_ONE_MEDIA,
			type: WhatToDo.UPDATE_FAVORITES,
			path,
		});
}

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export function ControlsAndSeeker({ audio }: RefToAudio) {
	const { random: isRandom, loop: loopThisMedia } = usePlayOptions();
	const isThereAMedia = Boolean(audio?.src);

	return (
		<ControlsAndSeekerContainer>
			<SeekerWrapper audio={audio} />

			<ControlsButtonsWrapper>
				<CircledIconButton
					data-tip="Toggle loop this media"
					onClick={toggleLoopMedia}
					disabled={isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <Repeat size="18" />}
				</CircledIconButton>

				<Controls isThereAMedia={isThereAMedia} isPaused={audio?.paused} />

				<CircledIconButton
					data-tip="Toggle random"
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

export const Header = ({ media, path }: RefToMedia) => (
	<OptionsAndAlbum>
		<CircledIconButton
			onClick={() => handleSearchAndOpenLyrics(media, path)}
			data-tip="Toggle open lyrics"
			disabled={!media}
		>
			{media?.lyrics ? <LyricsPresent size={16} /> : <NoLyrics size={16} />}
		</CircledIconButton>

		<Album>{media?.album}</Album>

		<CircledIconButton
			onClick={() => toggleFavorite(path)}
			data-tip="Toggle favorite"
			disabled={!media}
		>
			{favorites().has(path) ?
				<Favorite size={17} /> :
				<AddFavorite size={17} />}
		</CircledIconButton>
	</OptionsAndAlbum>
);

function handleSearchAndOpenLyrics(
	media: Media | undefined,
	mediaPath: Path,
): void {
	if (!media) return;

	if (media.lyrics) return flipMediaPlayerCard();

	if (!media.artist) {
		infoToast("Make sure that media has artist metadata!");
		return;
	}

	searchForLyricsAndImage(media.title, media.artist, media.img)
		.then(({ lyric, image }) => {
			sendMsgToBackend({
				type: ReactToElectronMessageEnum.WRITE_TAG,
				thingsToChange: [{ whatToChange: "imageURL", newValue: image }, {
					whatToChange: "lyrics",
					newValue: lyric,
				}],
				mediaPath,
			});
		})
		.catch(console.error);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Controls = ({ isPaused = false, isThereAMedia }: IsPaused) => (
	<ControlsWrapper>
		<CircledIconButton
			data-tip="Play previous track"
			onClick={playPreviousMedia}
			disabled={isThereAMedia}
		>
			<Previous />
		</CircledIconButton>

		<CircledIconButton
			onClick={togglePlayPause}
			disabled={isThereAMedia}
			data-tip="Play/pause"
			size="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</CircledIconButton>

		<CircledIconButton
			data-tip="Play next track"
			disabled={isThereAMedia}
			onClick={playNextMedia}
		>
			<Next />
		</CircledIconButton>
	</ControlsWrapper>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

function seek(e: SeekEvent, audio: Audio): void {
	if (!audio?.duration) return;

	const width = Number(
		getComputedStyle(e.currentTarget).width.replace("px", ""),
	);
	const clickX = e.nativeEvent.offsetX;
	const desiredTime = (clickX / width) * audio.duration;

	audio.currentTime = desiredTime;
}

/////////////////////////////////////////

export function SeekerWrapper({ audio }: RefToAudio) {
	const progressWrapperRef = useRef<HTMLDivElement>(null);
	const timeTooltipRef = useRef<HTMLSpanElement>(null);
	const { percentage, currentTime } = useProgress();

	const { formatedDuration, isDurationValid } = useMemo(() => ({
		formatedDuration: formatDuration(audio?.duration),
		// @ts-ignore => It will give false if duration is undefined:
		isDurationValid: audio?.duration > 0,
	}), [audio?.duration]);

	const handleTooltip = useCallback(
		({ nativeEvent: { offsetX: mouseX } }: SeekEvent): void => {
			/*
				- offsetX, offsetY:
					The X and Y coordinates of the mouse
					relative to the event source element.
			*/
			if (!audio || !isDurationValid) return;
			const tooltip = timeTooltipRef.current;
			const div = progressWrapperRef.current;
			if (!div || !tooltip) return;

			const progressBarWidth = floor(div.getBoundingClientRect().width);

			// Set lower barier at 0, otherwise, for some reason, it gives < 0 values:
			mouseX = mouseX < 0 ? 0 : mouseX;
			const mouseXPercentage = (mouseX / progressBarWidth) * 100;

			const time = (mouseXPercentage / 100) * audio.duration;
			const left = mouseX - (35 >> 1); // 35 is the width of the tooltip.
			// Also, (35 >> 1) is the half of the width (binary divide by 2).

			tooltip.textContent = formatDuration(time);
			tooltip.style.left = `${left}px`;
		},
		[isDurationValid, audio],
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
					// !NaN => true (in case is not present), everything else is false:
					css={{ width: `${!percentage ? 0 : percentage}%` }}
				/>
			</ProgressWrapper>

			<Duration>
				<p>{formatDuration(currentTime)}</p>

				<p>{formatedDuration}</p>
			</Duration>
		</SeekerContainer>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Audio = HTMLAudioElement | null;
type RefToAudio = Readonly<{ audio: Audio; }>;
type RefToMedia = Readonly<{ media: Media | undefined; path: Path; }>;
type SeekEvent = Readonly<React.MouseEvent<HTMLDivElement, MouseEvent>>;
type IsPaused = Readonly<{ isPaused?: boolean; isThereAMedia: boolean; }>;
