import { useSnapshot } from "valtio";
import {
	IoPlayBackSharp as Previous,
	IoPlayForwardSharp as Next,
} from "react-icons/io5";

import { playPreviousMedia, playNextMedia } from "@contexts/currentPlaying";
import { CircleIconButton } from "@components/CircleIconButton";
import { PlayPauseButton } from "./PlayPauseButton";
import { translation } from "@i18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function Controls({ isThereAMedia }: ControlsProps) {
	const t = useSnapshot(translation).t;

	return (
		<div className="media-player-controls">
			<CircleIconButton
				title={t("tooltips.playPreviousTrack")}
				onPointerUp={playPreviousMedia}
				disabled={!isThereAMedia}
			>
				<Previous />
			</CircleIconButton>

			<PlayPauseButton isThereAMedia={isThereAMedia} />

			<CircleIconButton
				title={t("tooltips.playNextTrack")}
				onPointerUp={playNextMedia}
				disabled={!isThereAMedia}
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

export type ControlsProps = { isThereAMedia: boolean };

/////////////////////////////////////////

export type Audio = HTMLAudioElement | null;
