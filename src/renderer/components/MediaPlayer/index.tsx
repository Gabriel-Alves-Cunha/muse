import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { GrFormPrevious as Previous } from "react-icons/gr";
import { BsPauseFill as Pause } from "react-icons/bs";
import { GrFormNext as Next } from "react-icons/gr";
import { BsPlayFill as Play } from "react-icons/bs";

import { useCurrentPlaying, usePlayOptions } from "@hooks";
import { formatTime } from "@common/utils";

import { theme } from "@styles/theme";
import {
	ProgressWrapper,
	SeekerWrapper,
	Controls,
	Wrapper,
	Info,
	Img,
} from "./styles";

export function MediaPlayer() {
	const [currentPlaying, dispatchCurrentPlaying] = useCurrentPlaying();
	const [playOptions] = usePlayOptions();

	const [progress, setProgress] = useState<Progress>({
		percentage: 0,
		current: 0,
	});
	const audioRef = useRef<HTMLAudioElement>(null);

	const playOrPauseMedia = () => {
		const audio = audioRef.current;
		if (!audio) return;
		const { currentTime, paused } = audio;

		paused
			? dispatchCurrentPlaying({ type: "resume", atSecond: currentTime })
			: dispatchCurrentPlaying({ type: "pause", atSecond: currentTime });
	};

	const playPreviousMedia = () =>
		dispatchCurrentPlaying({
			playlist: currentPlaying.playlist,
			type: "play previous",
		});

	const playNextMedia = () =>
		dispatchCurrentPlaying({
			playlist: currentPlaying.playlist,
			type: "play next",
		});

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.addEventListener("timeupdate", () => {
			const { duration, currentTime } = audio;

			setProgress({
				percentage: (currentTime / duration) * 100,
				current: currentTime,
			});
		});

		audio.addEventListener("ended", () => playNextMedia());
	}, []);

	function seek(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		const audio = audioRef.current;
		const duration = audio?.duration;
		const div = document.getElementById("goto");
		if (!audio || !div || !duration) return;

		const width = +getComputedStyle(div).width.replace("px", "");
		const clickX = e.nativeEvent.offsetX;
		const gotoSeconds = (clickX / width) * duration;

		audio.currentTime = gotoSeconds;
	}

	return (
		<Wrapper>
			<audio id="audio" preload="none" ref={audioRef} />

			<Img>
				{currentPlaying?.media?.img?.data ? (
					<img src={currentPlaying.media.img.data} />
				) : (
					<MusicNote size="1.4em" />
				)}
			</Img>

			<Info>
				<span className="title">{currentPlaying?.media?.title}</span>
				<span className="subtitle">{currentPlaying?.media?.artist}</span>
			</Info>

			<SeekerWrapper>
				<span>{formatTime(progress.current)}</span>

				<ProgressWrapper onClick={seek} id="goto">
					<div
						style={{
							backgroundColor: theme.colors.accent,
							width: `${progress.percentage}%`,
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

				<span>{currentPlaying.media?.duration ?? "00:00"}</span>
			</SeekerWrapper>

			<Controls>
				<span className="previous-or-next" onClick={playPreviousMedia}>
					<Previous size="25" />
				</span>

				<span className="play-pause" onClick={playOrPauseMedia}>
					{playOptions?.isPaused ? <Play size="28" /> : <Pause size="28" />}
				</span>

				<span className="previous-or-next" onClick={playNextMedia}>
					<Next size="25" />
				</span>
			</Controls>
		</Wrapper>
	);
}

type Progress = Readonly<{
	percentage: number;
	current: number;
}>;

MediaPlayer.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "MediaPlayer",
};
