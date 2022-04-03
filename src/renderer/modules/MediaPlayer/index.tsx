import { IoMdMusicalNote as MusicNote } from "react-icons/io";
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

import { ImgWithFallback } from "@components";
import { formatDuration } from "@common/utils";
import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	usePlayOptions,
	usePlaylists,
} from "@contexts";

import { ScaleUpIconButton } from "@modules/Navbar/styles";
import {
	OptionsAndAlbum,
	ProgressWrapper,
	SeekerContainer,
	ImgContainer,
	Controls,
	Wrapper,
	Info,
	ProgressThumb,
} from "./styles";

const useProgress = create<Progress>(() => ({ percentage: 0, current: 0 }));
const { getState: getCurrentPlaying } = useCurrentPlaying;
const { setState: setProgress } = useProgress;

export function MediaPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const { currentPlaying } = useCurrentPlaying();
	const { isFavorite } = usePlaylists();
	const {
		playOptions: { isRandom, loopThisMedia },
	} = usePlayOptions();

	const duration = currentPlaying.media?.duration;

	function playOrPauseMedia() {
		const audio = audioRef.current;
		if (!audio) return;

		audio.paused
			? getCurrentPlaying().setCurrentPlaying({
					type: CurrentPlayingEnum.RESUME,
			  })
			: getCurrentPlaying().setCurrentPlaying({
					type: CurrentPlayingEnum.PAUSE,
			  });
	}

	function seek(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		const audio = audioRef.current;
		if (!audio) return;
		const duration = audio.duration;
		const div = document.getElementById("goto");
		if (!div || !duration) return;

		const width = Number(getComputedStyle(div).width.replace("px", ""));
		const clickX = e.nativeEvent.offsetX;
		const go2Time = (clickX / width) * duration;

		audio.currentTime = go2Time;
	}

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			console.error("useEffect did not find an audio tag!");
			return;
		}

		audio.addEventListener("timeupdate", () => {
			const { duration, currentTime } = audio;

			setProgress({
				percentage: (currentTime / duration) * 100,
				current: currentTime,
			});
		});

		audio.addEventListener("ended", () => playNextMedia());
	}, []);

	return (
		<Wrapper>
			<audio id="audio" preload="none" ref={audioRef} />

			<OptionsAndAlbum>
				<ScaleUpIconButton style={{ width: 40, height: 40 }}>
					<Previous size="20px" />
				</ScaleUpIconButton>

				<span>{currentPlaying.media?.album}</span>

				<ScaleUpIconButton style={{ width: 40, height: 40 }}>
					{isFavorite(currentPlaying.media?.id) ? (
						<Favorite size="20px" />
					) : (
						<AddFavorite size="20px" />
					)}
				</ScaleUpIconButton>
			</OptionsAndAlbum>

			<ImgContainer>
				<ImgWithFallback
					Fallback={<MusicNote size="1.4em" />}
					media={currentPlaying?.media}
				/>
			</ImgContainer>

			<Info>
				<span className="title">{currentPlaying?.media?.title}</span>
				<span className="subtitle">{currentPlaying?.media?.artist}</span>
			</Info>

			<SeekerWrapper seek={seek} duration={duration} />

			<Controls>
				<span id="loop">{loopThisMedia ? <Repeat /> : <RepeatOne />}</span>

				<div>
					<span className="previous-or-next" onClick={playPreviousMedia}>
						<Previous />
					</span>

					<span className="play-pause" onClick={playOrPauseMedia}>
						{audioRef.current?.paused ? (
							<Play height={25} width={25} />
						) : (
							<Pause height={25} width={25} />
						)}
					</span>

					<span className="previous-or-next" onClick={playNextMedia}>
						<Next />
					</span>
				</div>

				<span id="random">{isRandom ? <RandomOn /> : <RandomOff />}</span>
			</Controls>
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

function playNextMedia() {
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getCurrentPlaying().currentPlaying.playlistName,
		type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
	});
}

function playPreviousMedia() {
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getCurrentPlaying().currentPlaying.playlistName,
		type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
	});
}

type Progress = Readonly<{
	percentage: number;
	current: number;
}>;
