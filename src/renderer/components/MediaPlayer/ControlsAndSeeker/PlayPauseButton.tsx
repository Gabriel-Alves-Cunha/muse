import type { ControlsProps } from "./Controls";

import { IoPauseSharp as Pause, IoPlaySharp as Play } from "react-icons/io5";
import { useEffect, useState } from "react";

import { getAudio, togglePlayPause } from "@contexts/currentPlaying";
import { selectT, useTranslator } from "@i18n";
import { CircleIconButton } from "@components/CircleIconButton";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function PlayPauseButton({ isThereAMedia }: ControlsProps): JSX.Element {
	const [isPaused, setIsPaused] = useState(true);
	const t = useTranslator(selectT);

	useEffect(() => {
		const audio = getAudio();

		if (!audio) return;

		const setIsPausedToFalse = (): void => setIsPaused(false);
		const setIsPausedToTrue = (): void => setIsPaused(true);

		audio.addEventListener("pause", setIsPausedToTrue);
		audio.addEventListener("play", setIsPausedToFalse);

		return () => {
			audio.removeEventListener("pause", setIsPausedToTrue);
			audio.removeEventListener("play", setIsPausedToFalse);
		};
	}, []);

	return (
		<CircleIconButton
			title={t("tooltips.playPause")}
			onPointerUp={togglePlayPause}
			disabled={!isThereAMedia}
			variant="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</CircleIconButton>
	);
}
