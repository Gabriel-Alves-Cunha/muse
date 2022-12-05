import type { RefToAudioAndSeeker } from "./Controls";

import { type Component, createEffect, createSignal, onMount } from "solid-js";

import { getProgress, setProgress } from ".";
import { formatDuration, mapTo } from "@common/utils";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SeekerWrapper: Component<RefToAudioAndSeeker> = (props) => {
	const [formatedDuration, setFormatedDuration] = createSignal("00:00");
	const [isDurationValid, setIsDurationValid] = createSignal(false);
	const { currentTime, percentage } = getProgress();
	let progressWrapper: HTMLDivElement | undefined;
	let timeTooltip: HTMLSpanElement | undefined;

	createEffect(() => {
		document.documentElement.style.setProperty(
			"--progress-width",
			// !NaN => true (in case is not present), everything else is false:
			`${percentage ? percentage : 0}%`,
		);
	});

	createEffect(() => {
		setFormatedDuration(formatDuration(props.audio?.duration));
		// @ts-ignore => It will give false if duration is undefined:
		setIsDurationValid(props.audio?.duration > 0);
	});

	const setTimerTooltip = ({ offsetX }: PointerEvent): void => {
		if (!(timeTooltip && props.audio)) return;

		const time =
			(offsetX / timeTooltip.getBoundingClientRect().width) *
			props.audio.duration;
		const left = offsetX - (35 >> 1); // 35 is the width of the tooltip.
		// Also, (35 >> 1) is the half of the width (binary divide by 2).

		timeTooltip.textContent = formatDuration(time);
		timeTooltip.style.left = `${left}px`;
	};

	const seek = ({ offsetX }: PointerEvent): void => {
		if (!(props.audio && timeTooltip && isFinite(props.audio.duration))) return;

		const desiredTime =
			(offsetX / timeTooltip.getBoundingClientRect().width) *
			props.audio.duration;
		const percentage = mapTo(desiredTime, [0, props.audio.duration], [0, 100]);

		setProgress((prev) => ({ ...prev, percentage }));
	};

	onMount(() => {
		timeTooltip!.addEventListener("pointermove", setTimerTooltip);

		timeTooltip!.addEventListener("pointerdown", (e) => {
			// Make sure that event is captured even if pointer moves away from timeTooltip rect bounds:
			timeTooltip!.setPointerCapture(e.pointerId);

			props.setIsSeeking(true);
			seek(e);

			timeTooltip!.addEventListener("pointermove", seek);
			timeTooltip!.addEventListener(
				"pointerup",
				(e) => {
					timeTooltip!.removeEventListener("pointermove", seek);

					props.setIsSeeking(false);

					const desiredTime =
						(e.offsetX / timeTooltip!.getBoundingClientRect().width) *
						props.audio!.duration;

					props.audio!.currentTime = desiredTime;
				},
				{ once: true },
			);
		});
	});

	return (
		<div class="flex flex-col w-full gap-2">
			<div
				class={`group relative block w-full h-1 bg-main ${
					isDurationValid() ? "cursor-pointer" : "cursor-default"
				}`}
				// onPointerUp={e => seek(e, audio)}
				// onPointerMove={setTimerTooltip}
				ref={progressWrapper as HTMLDivElement}
			>
				<span // Timer tooltip
					class="group-hover:progress group-focus:progress"
					classList={{ hidden: isDurationValid() }}
					ref={timeTooltip as HTMLSpanElement}
				/>

				<div class={"relative bg-accent h-full w-[var(--progress-width)]"} />
			</div>

			<div class="flex justify-between items-center text-icon-media-player font-primary text-center text-lg">
				<p>{formatDuration(currentTime)}</p>

				<p>{formatedDuration()}</p>
			</div>
		</div>
	);
};
