import type { ControlsProps } from "./Controls";

import { IoPauseSharp as Pause, IoPlaySharp as Play } from "react-icons/io5";
import { useEffect, useState } from "react";

import { getAudio, togglePlayPause } from "@contexts/useCurrentPlaying";
import { CircleIconButton } from "@components/CircleIconButton";
import { useTranslation } from "@i18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function PlayPauseButton({ isThereAMedia }: ControlsProps) {
	const [isPaused, setIsPaused] = useState(true);
	const { t } = useTranslation();

	const setIsPausedToFalse = () => setIsPaused(false);
	const setIsPausedToTrue = () => setIsPaused(true);

	useEffect(() => {
		const audio = getAudio();
		if (!audio) return;

		audio.addEventListener("pause", setIsPausedToTrue);
		audio.addEventListener("play", setIsPausedToFalse);
	}, [isThereAMedia]);

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