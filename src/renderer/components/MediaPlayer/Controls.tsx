import { useI18n } from "@solid-primitives/i18n";
import {
	type Component,
	type Accessor,
	type Setter,
	createSignal,
	onMount,
	Show,
} from "solid-js";

import { CircleIconButton } from "@components/CircleIconButton";
import { ShuffleOffIcon } from "@icons/ShuffleOffIcon";
import { RepeatOneIcon } from "@icons/RepeatOneIcon";
import { ShuffleOnIcon } from "@icons/ShuffleOnIcon";
import { SeekerWrapper } from "./Seeker";
import { RepeatIcon } from "@icons/RepeatIcon";
import { PauseIcon } from "@icons/PauseIcon";
import { RightIcon } from "@icons/RightIcon";
import { LeftIcon } from "@icons/LeftIcon";
import { PlayIcon } from "@icons/PlayIcon";
import {
	toggleLoopMedia,
	usePlayOptions,
	toggleRandom,
} from "@contexts/usePlayOptions";
import {
	playPreviousMedia,
	togglePlayPause,
	playNextMedia,
} from "@contexts/useCurrentPlaying";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ControlsAndSeeker: Component<RefToAudioAndSeeker> = (props) => {
	const { isRandom, loop } = usePlayOptions();
	const [t] = useI18n();

	const isThereAMedia = () => !(props.audio && props.audio.src.length > 0);

	return (
		<div class="absolute flex flex-col bottom-10 w-full">
			<SeekerWrapper
				setIsSeeking={props.setIsSeeking}
				isSeeking={props.isSeeking}
				audio={props.audio}
			/>

			<div class="flex justify-between items-center mt-[10%]">
				<CircleIconButton
					title={t("tooltips.toggleLoopThisMedia")}
					onPointerUp={toggleLoopMedia}
					disabled={isThereAMedia()}
				>
					<Show when={loop} fallback={<RepeatIcon class="w-4 h-4" />}>
						<RepeatOneIcon class="w-4 h-4" />
					</Show>
				</CircleIconButton>

				<Controls audio={props.audio} isDisabled={isThereAMedia()} />

				<CircleIconButton
					title={t("tooltips.toggleRandom")}
					onPointerUp={toggleRandom}
					disabled={isThereAMedia()}
				>
					<Show when={isRandom} fallback={<ShuffleOffIcon class="w-4 h-4" />}>
						<ShuffleOnIcon class="w-4 h-4" />
					</Show>
				</CircleIconButton>
			</div>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const PlayPauseButton: Component<ControlsProps> = (props) => {
	const [isPaused, setIsPaused] = createSignal(true);
	const [t] = useI18n();

	onMount(() => {
		props.audio!.addEventListener("pause", () => setIsPaused(true));
		props.audio!.addEventListener("play", () => setIsPaused(false));
	});

	return (
		<CircleIconButton
			title={t("tooltips.playPause")}
			onPointerUp={togglePlayPause}
			disabled={props.isDisabled}
			variant="large"
		>
			<Show when={isPaused()} fallback={<PauseIcon class="w-5 h-5" />}>
				<PlayIcon class="w-5 h-5" />
			</Show>
		</CircleIconButton>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Controls: Component<ControlsProps> = (props) => {
	const [t] = useI18n();

	return (
		<div class="relative flex justify-center items-center w-[120px]">
			<CircleIconButton
				title={t("tooltips.playPreviousTrack")}
				onPointerUp={playPreviousMedia}
				disabled={props.isDisabled}
			>
				<LeftIcon />
			</CircleIconButton>

			<PlayPauseButton isDisabled={props.isDisabled} audio={props.audio} />

			<CircleIconButton
				title={t("tooltips.playNextTrack")}
				onPointerUp={playNextMedia}
				disabled={props.isDisabled}
			>
				<RightIcon />
			</CircleIconButton>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type ControlsProps = { isDisabled: boolean; audio: Audio };

/////////////////////////////////////////

export type RefToAudioAndSeeker = {
	setIsSeeking: Setter<boolean>;
	isSeeking: Accessor<boolean>;
	audio: Audio;
};

/////////////////////////////////////////

export type Audio = HTMLAudioElement | undefined;
