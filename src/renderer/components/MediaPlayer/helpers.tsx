import type { Media, Path } from "@common/@types/generalTypes";

import { BsJournalText as LyricsPresent } from "react-icons/bs";
import { useCallback, useMemo, useRef } from "react";
import { BsJournal as NoLyrics } from "react-icons/bs";
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
import { flipMediaPlayerCard } from "./Lyrics";
import { sendMsgToBackend } from "@common/crossCommunication";
import { formatDuration } from "@common/utils";
import { useProgress } from ".";
import { infoToast } from "@styles/global";
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
	PlaylistActions,
	setPlaylists,
	favorites,
	WhatToDo,
} from "@contexts/usePlaylists";

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

function toggleFavorite(path: Readonly<Path>): void {
	if (path.length > 0)
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
	// `audio !== null && audio.src.length > 0`:
	const isThereAMedia = Boolean(!audio?.src);

	return (
		<ControlsAndSeekerContainer>
			<SeekerWrapper audio={audio} />

			<ControlsButtonsWrapper>
				<CircledIconButton
					data-tip={t("tooltips.toggleLoopThisMedia")}
					onClick={toggleLoopMedia}
					disabled={isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <Repeat size="18" />}
				</CircledIconButton>

				<Controls isDisabled={isThereAMedia} isPaused={audio?.paused} />

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

export const Header = ({ media, path, displayTitle = false }: HeaderProps) => (
	<OptionsAndAlbum>
		<CircledIconButton
			onClick={async () => {
				if (media?.lyrics)
					return flipMediaPlayerCard();

				await searchAndOpenLyrics(media, path, true);
			}}
			data-tip={t("tooltips.toggleOpenLyrics")}
			disabled={media === undefined}
			data-side="bottom"
		>
			{media?.lyrics ? <LyricsPresent size={16} /> : <NoLyrics size={16} />}
		</CircledIconButton>

		<Album>{displayTitle === true ? media?.title : media?.album}</Album>

		<CircledIconButton
			data-tip={t("tooltips.toggleFavorite")}
			onClick={() => toggleFavorite(path)}
			disabled={media === undefined}
		>
			{favorites().has(path) === true ?
				<Favorite size={17} /> :
				<AddFavorite size={17} />}
		</CircledIconButton>
	</OptionsAndAlbum>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export async function searchAndOpenLyrics(
	media: Media | undefined,
	mediaPath: Path,
	openLyrics: boolean,
): Promise<void> {
	if (media === undefined) return;

	if (media.artist.length === 0) {
		infoToast(t("toasts.assureMediaHasArtistMetadata"));
		return;
	}

	// If there is no image already, go get one:
	const getImage = media.image.length === 0;

	try {
		const { lyric, image, albumName } = await searchForLyricsAndImage(
			media.title,
			media.artist,
			getImage,
		);

		sendMsgToBackend({
			type: ReactToElectronMessageEnum.WRITE_TAG,
			// dprint-ignore
			thingsToChange: [
				{ whatToChange: "album", newValue: albumName },
				{ whatToChange: "imageURL",	newValue: image	},
				{ whatToChange: "lyrics", newValue: lyric }
			],
			mediaPath,
		});
	} catch (error) {
		if ((error as Error).message.includes("No lyrics found"))
			infoToast(`${t("toasts.noLyricsFound")}"${media.title}"!`);

		console.error(error);
	}

	if (media.lyrics.length > 0 && openLyrics === true)
		return flipMediaPlayerCard();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Controls = ({ isPaused = false, isDisabled }: IsPaused) => (
	<ControlsWrapper>
		<CircledIconButton
			data-tip={t("tooltips.playPreviousTrack")}
			onClick={playPreviousMedia}
			disabled={isDisabled}
		>
			<Previous />
		</CircledIconButton>

		<CircledIconButton
			data-tip={t("tooltips.playPause")}
			onClick={togglePlayPause}
			disabled={isDisabled}
			size="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</CircledIconButton>

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
			if (
				audio === null || isDurationValid === false || timeTooltipRef
						.current === null ||
				progressWrapperRef.current === null
			)
				return;

			const tooltip = timeTooltipRef.current;
			const div = progressWrapperRef.current;
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
type SeekEvent = Readonly<React.MouseEvent<HTMLDivElement, MouseEvent>>;
type IsPaused = Readonly<{ isPaused?: boolean; isDisabled: boolean; }>;
type HeaderProps = Readonly<
	{ media: Media | undefined; displayTitle?: boolean; path: Path; }
>;
