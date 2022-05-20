import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { useEffect, useRef } from "react";
import create from "zustand";

import { ControlsAndSeeker, Header, playNextMedia } from "./helpers";
import { useCurrentPlaying } from "@contexts/mediaHandler/useCurrentPlaying";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { usePlaylists } from "@contexts/mediaHandler/usePlaylists";

import { SquareImage, Wrapper, Info } from "./styles";

export const useProgress = create<Progress>(() => ({
	currentTime: 0,
	percentage: 0,
}));
const { setState: setProgress } = useProgress;

export function MediaPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const { currentPlaying } = useCurrentPlaying();
	const { mainList } = usePlaylists();

	const media = mainList.find(m => m.id === currentPlaying.path);
	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

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

			<Header media={media} />

			<SquareImage>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size="1.4rem" />}
						media={media}
					/>
				</div>
			</SquareImage>

			<Info>
				<span id="title">{media?.title}</span>
				<span id="subtitle">{media?.artist}</span>
			</Info>

			<ControlsAndSeeker audio={audio} />
		</Wrapper>
	);
}

type Progress = Readonly<{
	currentTime: number;
	percentage: number;
}>;

MediaPlayer.whyDidYouRender = {
	customName: "MediaPlayer",
};
