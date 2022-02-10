import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef } from "react";
import {
	TrackPreviousIcon as Previous,
	TrackNextIcon as Next,
	PauseIcon as Pause,
	PlayIcon as Play,
} from "@radix-ui/react-icons";
import create from "zustand";

import { formatDuration } from "@common/utils";
import {
	useCurrentPlaying,
	Type,
} from "@contexts/mediaHandler/useCurrentPlaying";

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
const { setState: setProgress, getState: getProgress } = useProgress;
const { getState: getCurrentPlaying } = useCurrentPlaying;

function playNextMedia() {
	getCurrentPlaying().setCurrentPlaying({
		playlist: getCurrentPlaying().currentPlaying.playlist,
		type: Type.PLAY_NEXT,
	});
}

function playPreviousMedia() {
	getCurrentPlaying().setCurrentPlaying({
		playlist: getCurrentPlaying().currentPlaying.playlist,
		type: Type.PLAY_PREVIOUS,
	});
}

export function MediaPlayer() {
	const { setCurrentPlaying } = useCurrentPlaying();
	const { currentPlaying } = useCurrentPlaying();
	const audioRef = useRef<HTMLAudioElement>(null);

	function playOrPauseMedia() {
		const audio = audioRef.current;
		if (!audio) return;

		audio.paused
			? setCurrentPlaying({ type: Type.RESUME })
			: setCurrentPlaying({ type: Type.PAUSE });
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
				{currentPlaying?.media?.img ? (
					<img src={currentPlaying.media.img} />
				) : (
					<MusicNote size="1.4em" />
				)}
			</Img>

			<Info>
				<span className="title">{currentPlaying?.media?.title}</span>
				<span className="subtitle">{currentPlaying?.media?.artist}</span>
			</Info>

			<SeekerWrapper seek={seek} />

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
}: {
	seek: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
	const duration = useCurrentPlaying().currentPlaying.media?.duration;

	return (
		<SeekerContainer>
			<span>{formatDuration(getProgress().current)}</span>

			<ProgressWrapper onClick={seek} id="goto">
				<div
					style={{
						backgroundColor: theme.colors.accent,
						width: `${getProgress().percentage}%`,
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
	logOnDifferentValues: false,
	customName: "MediaPlayer",
};

type Progress = Readonly<{
	percentage: number;
	current: number;
}>;
