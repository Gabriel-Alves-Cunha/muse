import {
	IoPlayBackSharp as Previous,
	IoPlayForwardSharp as Next,
} from "react-icons/io5";

import { playPreviousMedia, playNextMedia } from "@contexts/useCurrentPlaying";
import { CircleIconButton } from "@components/CircleIconButton";
import { PlayPauseButton } from "./PlayPauseButton";
import { useTranslation } from "@i18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function Controls({ isDisabled, audio }: ControlsProps) {
	const { t } = useTranslation();

	return (
		<div className="media-player-controls">
			<CircleIconButton
				title={t("tooltips.playPreviousTrack")}
				onPointerUp={playPreviousMedia}
				disabled={isDisabled}
			>
				<Previous />
			</CircleIconButton>

			<PlayPauseButton isDisabled={isDisabled} audio={audio} />

			<CircleIconButton
				title={t("tooltips.playNextTrack")}
				onPointerUp={playNextMedia}
				disabled={isDisabled}
			>
				<Next />
			</CircleIconButton>
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

export type ControlsProps = { isDisabled: boolean; audio: Audio };

/////////////////////////////////////////

export type Audio = HTMLAudioElement | null;
