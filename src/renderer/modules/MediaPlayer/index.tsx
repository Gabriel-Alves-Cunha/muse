import { BiLeftArrow as Previous, BiRightArrow as Next } from "react-icons/bi";
import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { FaPlay as Play } from "react-icons/fa";
import {
	BsThreeDotsVertical as Dots,
	BsFillPauseFill as Pause,
} from "react-icons/bs";
import {
	MdFavoriteBorder as AddFavorite,
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdFavorite as Favorite,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";

import { useCallback, useEffect, useRef } from "react";
import create from "zustand";

import { dbg, formatDuration } from "@common/utils";
import { ImgWithFallback } from "@components";
import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlayOptionsType,
	usePlayOptions,
	usePlaylists,
} from "@contexts";

import { ScaleUpIconButton } from "@modules/Navbar/styles";
import {
	ControlsAndSeekerContainer,
	ButtonForRandomAndLoop,
	OptionsAndAlbum,
	ProgressWrapper,
	SeekerContainer,
	ControlsWrapper,
	ProgressThumb,
	OptionsButton,
	SquareImage,
	Wrapper,
	Album,
	Info,
} from "./styles";

const { ceil } = Math;

const useProgress = create<Progress>(() => ({ percentage: 0, currentTime: 0 }));
const { getState: getPlaylistsFunctions } = usePlaylists;
const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlayOptions } = usePlayOptions;
const { setState: setProgress } = useProgress;

const toggleRepeatThisMedia = () =>
	getPlayOptions().setPlayOptions({
		value: getPlayOptions().playOptions.loopThisMedia ? false : true,
		type: PlayOptionsType.LOOP_THIS_MEDIA,
	});

const playOrPauseMedia = (audio: HTMLAudioElement | null) =>
	audio?.paused
		? getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.RESUME,
		  })
		: getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PAUSE,
		  });

const playNextMedia = () =>
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getCurrentPlaying().currentPlaying.playlistName,
		type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
	});

const playPreviousMedia = () =>
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getCurrentPlaying().currentPlaying.playlistName,
		type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
	});

export function MediaPlayer() {
	const { isRandom, loopThisMedia } = usePlayOptions().playOptions;
	const audioRef = useRef<HTMLAudioElement>(null);
	const { currentPlaying } = useCurrentPlaying();

	const media = getPlaylistsFunctions().mainList.find(
		m => m.id === currentPlaying.mediaID,
	);
	const audio = audioRef.current;

	const seek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!audio) return;
		const duration = audio.duration;
		const div = document.getElementById("goto");
		if (!div || !duration) return;

		const width = Number(getComputedStyle(div).width.replace("px", ""));
		const clickX = e.nativeEvent.offsetX;
		const desiredTime = (clickX / width) * duration;

		audio.currentTime = desiredTime;
	};

	useEffect(() => {
		if (!audio) return;
		dbg("Setting progress listener.");

		const handleProgress = () => {
			const { duration, currentTime } = audio;

			setProgress({
				percentage: (currentTime / duration) * 100,
				currentTime,
			});
		};

		audio.addEventListener("timeupdate", handleProgress);
		audio.addEventListener("ended", playNextMedia);

		return () => {
			audio.removeEventListener("timeupdate", handleProgress);
			audio.removeEventListener("ended", playNextMedia);
		};
	}, [audio]);

	return (
		<Wrapper>
			<>
				<audio id="audio" preload="none" ref={audioRef} />
			</>

			<OptionsAndAlbum>
				<OptionsButton>
					<Dots size="17" />
				</OptionsButton>

				<Album>{media?.album}</Album>

				<ScaleUpIconButton style={{ width: 25, height: 25 }}>
					{media?.favorite ? <Favorite size="17" /> : <AddFavorite size="17" />}
				</ScaleUpIconButton>
			</OptionsAndAlbum>

			<SquareImage>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size="1.4em" />}
						media={media}
					/>
				</div>
			</SquareImage>

			<Info>
				<span id="title">{media?.title}</span>
				<span id="subtitle">{media?.artist}</span>
			</Info>

			<ControlsAndSeekerContainer>
				<SeekerWrapper seek={seek} duration={audio?.duration} />

				<ControlsWrapper>
					<ButtonForRandomAndLoop onClick={toggleRepeatThisMedia}>
						{loopThisMedia ? <Repeat size="18" /> : <RepeatOne size="18" />}
					</ButtonForRandomAndLoop>

					<Controls audio={audio} />

					<ButtonForRandomAndLoop>
						{/* TODO ^ */}
						{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
					</ButtonForRandomAndLoop>
				</ControlsWrapper>
			</ControlsAndSeekerContainer>
		</Wrapper>
	);
}

const Controls = ({ audio }: { audio: HTMLAudioElement | null }) => (
	<div>
		<span className="previous-or-next" onClick={playPreviousMedia}>
			<Previous />
		</span>

		<span id="play-pause" onClick={() => playOrPauseMedia(audio)}>
			{audio?.paused ? <Play size="25" /> : <Pause size="25" />}
		</span>

		<span className="previous-or-next" onClick={playNextMedia}>
			<Next />
		</span>
	</div>
);

function SeekerWrapper({
	duration,
	seek,
}: {
	seek: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	duration?: number;
}) {
	const progressWrapperRef = useRef<HTMLDivElement>(null);
	const timeTooltipRef = useRef<HTMLSpanElement>(null);
	const { percentage, currentTime } = useProgress();

	const isDurationValid =
		typeof duration === "number" && !Number.isNaN(duration);

	const handleTooltip = useCallback(
		({
			nativeEvent: { offsetX: mouseX },
		}: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
			const time = (mouseXPercentage / 100) * duration;

			const left = mouseX - (35 >> 1); // 35 is the width of the tooltip. Also, (35 >> 1) is the half of the width (binary divide by 2).
			tooltip.innerText = formatDuration(time);
			tooltip.style.left = `${left}px`;
		},
		[duration, isDurationValid],
	);

	return (
		<SeekerContainer>
			<span>{formatDuration(currentTime)}</span>

			<ProgressWrapper
				style={{ cursor: isDurationValid ? "pointer" : "default" }}
				onMouseMove={handleTooltip}
				ref={progressWrapperRef}
				onClick={seek}
				id="goto"
			>
				<span
					style={{ display: isDurationValid ? "block" : "none" }}
					ref={timeTooltipRef}
				/>

				<ProgressThumb
					style={{
						width: `${percentage}%`,
					}}
				></ProgressThumb>
			</ProgressWrapper>

			<span>{formatDuration(duration)}</span>
		</SeekerContainer>
	);
}

type Progress = Readonly<{
	percentage: number;
	currentTime: number;
}>;
