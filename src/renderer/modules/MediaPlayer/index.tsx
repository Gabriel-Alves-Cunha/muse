import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef } from "react";
import {
	TrackPreviousIcon as Previous,
	TrackNextIcon as Next,
	PauseIcon as Pause,
	PlayIcon as Play,
} from "@radix-ui/react-icons";
import create from "zustand";

import { useCurrentPlaying, CurrentPlayingType } from "@contexts";
import { ImgWithFallback } from "@components";
import { formatDuration } from "@common/utils";

import { theme } from "@styles/theme";
import {
	ProgressWrapper,
	SeekerContainer,
	Controls,
	Wrapper,
	Info,
	Img,
} from "./styles";

const useProgress = create<Progress>(() => ({ percentage: 0, current: 0 }));
const { getState: getCurrentPlaying } = useCurrentPlaying;
const { setState: setProgress } = useProgress;

function playNextMedia() {
	getCurrentPlaying().setCurrentPlaying({
		playlist: getCurrentPlaying().currentPlaying.playlist,
		type: CurrentPlayingType.PLAY_NEXT,
	});
}

function playPreviousMedia() {
	getCurrentPlaying().setCurrentPlaying({
		playlist: getCurrentPlaying().currentPlaying.playlist,
		type: CurrentPlayingType.PLAY_PREVIOUS,
	});
}

export function MediaPlayer() {
	const duration = useCurrentPlaying().currentPlaying.media?.duration;
	const { currentPlaying } = useCurrentPlaying();
	const audioRef = useRef<HTMLAudioElement>(null);

	function playOrPauseMedia() {
		const audio = audioRef.current;
		if (!audio) return;

		audio.paused
			? getCurrentPlaying().setCurrentPlaying({
					type: CurrentPlayingType.RESUME,
			  })
			: getCurrentPlaying().setCurrentPlaying({
					type: CurrentPlayingType.PAUSE,
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
		const gotoTime = (clickX / width) * duration;

		audio.currentTime = gotoTime;
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

			<Img>
				<ImgWithFallback
					Fallback={<MusicNote size="1.4em" />}
					media={currentPlaying?.media}
				/>
			</Img>

			<Info>
				<span className="title">{currentPlaying?.media?.title}</span>
				<span className="subtitle">{currentPlaying?.media?.artist}</span>
			</Info>

			<SeekerWrapper seek={seek} duration={duration} />

			<Controls>
				<span className="previous-or-next" onClick={playPreviousMedia}>
					<Previous />
				</span>

				<span className="play-pause" onClick={playOrPauseMedia}>
					{audioRef.current?.paused ? (
						<Play height={20} width={20} />
					) : (
						<Pause height={20} width={20} />
					)}
				</span>

				<span className="previous-or-next" onClick={playNextMedia}>
					<Next />
				</span>
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
				<div
					style={{
						backgroundColor: theme.colors.accent,
						width: `${percentage}%`,
						position: "relative",
						height: "3px",
						left: 0,
						top: 0,
					}}
				>
					<div
						style={{
							border: `1px solid ${theme.colors.accent}`,
							animation: "move 1s ease-in-out infinite",
							transform: "translate(0, -25%)",
							position: "absolute",
							borderRadius: "50%",
							background: "white",
							right: "-3px",
							height: "6px",
							width: "6px",
							top: 0,
						}}
					/>
				</div>
			</ProgressWrapper>

			<span>{duration ?? "00:00"}</span>
		</SeekerContainer>
	);
}

MediaPlayer.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "MediaPlayer",
};

type Progress = Readonly<{
	percentage: number;
	current: number;
}>;
