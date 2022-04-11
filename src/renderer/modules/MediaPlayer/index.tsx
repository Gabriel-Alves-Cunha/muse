import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { BsFillPauseFill as Pause } from "react-icons/bs";
import { FaPlay as Play } from "react-icons/fa";
import {
	MdFavoriteBorder as AddFavorite,
	MdSkipPrevious as Previous,
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdFavorite as Favorite,
	MdShuffle as RandomOff,
	MdSkipNext as Next,
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
	ProgressThumb,
	OptionsButton,
	SquareImage,
	Controls,
	Wrapper,
	Album,
	Info,
} from "./styles";

const { ceil } = Math;

const useProgress = create<Progress>(() => ({ percentage: 0, current: 0 }));
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
	const { mainList } = usePlaylists();

	const media = mainList.find(m => m.id === currentPlaying.mediaID);
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
				current: currentTime,
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
			<audio id="audio" preload="none" ref={audioRef} />

			<OptionsAndAlbum>
				<OptionsButton>
					<Dots size="17" />
				</OptionsButton>

				<Album>{media?.album}</Album>

				<ScaleUpIconButton style={{ width: 25, height: 25 }}>
					{media?.favorite ? (
						<Favorite size="17" />
					) : (
						<AddFavorite size="17" />
					)}
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
				<span className="title">{media?.title}</span>
				<span className="subtitle">{media?.artist}</span>
			</Info>

			<ControlsAndSeekerContainer>
				<SeekerWrapper seek={seek} duration={audio?.duration} />

				<Controls>
					<ButtonForRandomAndLoop onClick={toggleRepeatThisMedia}>
						{loopThisMedia ? <Repeat size="18" /> : <RepeatOne size="18" />}
					</ButtonForRandomAndLoop>

					<div>
						<span className="previous-or-next" onClick={playPreviousMedia}>
							<Previous />
						</span>

						<span
							className="play-pause"
							onClick={() => playOrPauseMedia(audio)}
						>
							{audio?.paused ? <Play size="25" /> : <Pause size="25" />}
						</span>

						<span className="previous-or-next" onClick={playNextMedia}>
							<Next />
						</span>
					</div>

					<ButtonForRandomAndLoop>
						{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
					</ButtonForRandomAndLoop>
				</Controls>
			</ControlsAndSeekerContainer>
		</Wrapper>
	);
}

function SeekerWrapper({
	seek,
	duration,
}: {
	seek: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	duration?: number;
}) {
	const progressWrapperRef = useRef<HTMLDivElement>(null);
	const timeTooltipRef = useRef<HTMLSpanElement>(null);
	const { percentage, current } = useProgress();

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

			const left = mouseX - (35 >> 1); // 35 is the width of the tooltip. Also, (35 >> 1) is the half of the width.
			tooltip.innerText = formatDuration(time);
			tooltip.style.left = `${left}px`;
		},
		[duration, isDurationValid],
	);

	return (
		<SeekerContainer>
			<span>{formatDuration(current)}</span>

			<ProgressWrapper
				style={{ cursor: isDurationValid ? "pointer" : "default" }}
				onMouseMove={handleTooltip}
				ref={progressWrapperRef}
				onClick={seek}
				id="goto"
			>
				{isDurationValid && <span id="time-tooltip" ref={timeTooltipRef} />}

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
	current: number;
}>;
