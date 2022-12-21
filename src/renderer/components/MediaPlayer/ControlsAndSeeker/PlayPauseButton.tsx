import type { ControlsProps } from "./Controls";

import { IoPauseSharp as Pause, IoPlaySharp as Play } from "react-icons/io5";
import { useEffect, useState } from "react";

import { CircleIconButton } from "@components/CircleIconButton";
import { togglePlayPause } from "@contexts/useCurrentPlaying";
import { useTranslation } from "@i18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const PlayPauseButton = ({ isDisabled, audio }: ControlsProps) => {
	const [isPaused, setIsPaused] = useState(true);
	const { t } = useTranslation();

	const setIsPausedToFalse = () => setIsPaused(false);
	const setIsPausedToTrue = () => setIsPaused(true);

	useEffect(() => {
		if (!audio) return;

		audio.onpause = setIsPausedToTrue;
		audio.onplay = setIsPausedToFalse;
	}, [audio]);

	return (
		<CircleIconButton
			title={t("tooltips.playPause")}
			onPointerUp={togglePlayPause}
			disabled={isDisabled}
			variant="large"
		>
			{isPaused ? <Play size={25} /> : <Pause size={25} />}
		</CircleIconButton>
	);
};
