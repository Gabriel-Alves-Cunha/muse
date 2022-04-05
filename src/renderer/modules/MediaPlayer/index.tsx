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

import { useEffect, useRef } from "react";
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
	ControlsAndSeekerContainer,
} from "./styles";

const useProgress = create<Progress>(() => ({ percentage: 0, current: 0 }));
const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlayOptions } = usePlayOptions;
const { getState: getPlaylists } = usePlaylists;
const { setState: setProgress } = useProgress;

const { isFavorite } = getPlaylists();

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
	const audioRef = useRef<HTMLAudioElement>(null);
	const { currentPlaying } = useCurrentPlaying();
	const {
		playOptions: { isRandom, loopThisMedia },
	} = usePlayOptions();

	const duration = currentPlaying.media?.duration;
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
		dbg("Setting progress listener");

		audio.addEventListener("timeupdate", () => {
			const { duration, currentTime } = audio;

			setProgress({
				percentage: (currentTime / duration) * 100,
				current: currentTime,
			});
		});

		audio.addEventListener("ended", () => playNextMedia());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Wrapper>
			<audio id="audio" preload="none" ref={audioRef} />

			<OptionsAndAlbum>
				<OptionsButton>
					<Dots size="17" />
				</OptionsButton>

				<Album>{currentPlaying.media?.album}</Album>

				<ScaleUpIconButton style={{ width: 25, height: 25 }}>
					{isFavorite(currentPlaying.media?.id) ? (
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
						media={currentPlaying?.media}
					/>
				</div>
			</SquareImage>

			<Info>
				<span className="title">{currentPlaying?.media?.title}</span>
				<span className="subtitle">{currentPlaying?.media?.artist}</span>
			</Info>

			<ControlsAndSeekerContainer>
				<SeekerWrapper seek={seek} duration={duration} />

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
	duration: string | undefined;
}) {
	const { percentage, current } = useProgress();

	return (
		<SeekerContainer>
			<span>{formatDuration(current)}</span>

			<ProgressWrapper onClick={seek} id="goto">
				<ProgressThumb
					style={{
						width: `${percentage}%`,
					}}
				></ProgressThumb>
			</ProgressWrapper>

			<span>{duration ?? "00:00"}</span>
		</SeekerContainer>
	);
}

type Progress = Readonly<{
	percentage: number;
	current: number;
}>;
