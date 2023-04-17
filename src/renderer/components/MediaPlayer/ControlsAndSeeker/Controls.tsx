import {
	IoPlayBackSharp as Previous,
	IoPlayForwardSharp as Next,
} from "react-icons/io5";

import { playPreviousMedia, playNextMedia } from "@contexts/currentPlaying";
import { selectT, useTranslator } from "@i18n";
import { CircleIconButton } from "@components/CircleIconButton";
import { PlayPauseButton } from "./PlayPauseButton";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function Controls({ isThereAMedia }: ControlsProps): JSX.Element {
	const t = useTranslator(selectT);

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

export type ControlsProps = Readonly<{ isThereAMedia: boolean }>;

/////////////////////////////////////////

export type Audio = HTMLAudioElement | null;
