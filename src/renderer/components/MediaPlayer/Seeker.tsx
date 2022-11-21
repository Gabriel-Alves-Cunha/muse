import type { RefToAudioAndSeeker } from "./Controls";

import { useEffect, useMemo, useRef } from "react";

import { formatDuration, mapTo } from "@common/utils";
import { useProgress } from ".";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function SeekerWrapper({ audio, isSeeking }: RefToAudioAndSeeker) {
	const progressWrapperRef = useRef<HTMLDivElement>(null);
	const timeTooltipRef = useRef<HTMLSpanElement>(null);

	const { formatedDuration, isDurationValid } = useMemo(
		() => ({
			formatedDuration: formatDuration(audio?.duration),
			// @ts-ignore => It will give false if duration is undefined:
			isDurationValid: audio?.duration > 0,
		}),
		[audio?.duration],
	);

	useEffect(() => {
		// dprint-ignore
		if (
			progressWrapperRef.current === null ||
			timeTooltipRef.current === null ||
			isDurationValid === false ||
			audio === null
		)
			return;

		const timeline = progressWrapperRef.current;
		const timerTooltip = timeTooltipRef.current;

		function setTimerTooltip({ offsetX }: PointerEvent): void {
			if (audio === null) return;

			const time =
				(offsetX / timeline.getBoundingClientRect().width) * audio.duration;
			const left = offsetX - (35 >> 1); // 35 is the width of the tooltip.
			// Also, (35 >> 1) is the half of the width (binary divide by 2).

			timerTooltip.textContent = formatDuration(time);
			timerTooltip.style.left = `${left}px`;
		}

		function seek({ offsetX }: PointerEvent): void {
			if (audio === null || isNaN(audio.duration) || !isFinite(audio.duration))
				return;

			const desiredTime =
				(offsetX / timeline.getBoundingClientRect().width) * audio.duration;
			const percentage = mapTo(desiredTime, [0, audio.duration], [0, 100]);

			useProgress.setState({ percentage });
		}

		timeline.addEventListener("pointermove", setTimerTooltip);

		timeline.addEventListener("pointerdown", (e) => {
			// Make sure that event is captured even if pointer moves away from timeline rect bounds:
			timeline.setPointerCapture(e.pointerId);

			isSeeking.current = true;
			seek(e);

			timeline.addEventListener("pointermove", seek);
			timeline.addEventListener(
				"pointerup",
				(e) => {
					timeline.removeEventListener("pointermove", seek);

					isSeeking.current = false;

					const desiredTime =
						(e.offsetX / timeline.getBoundingClientRect().width) *
						audio.duration;

					audio.currentTime = desiredTime;
				},
				{ once: true },
			);
		});
	}, [audio, isDurationValid, isSeeking]);

	return (
		<div className="flex flex-col w-full px-3 gap-2">
			<div
				className={
					"group relative block w-full h-1 bg-main " + isDurationValid
						? "cursor-pointer"
						: "cursor-default"
				}
				// onPointerUp={e => seek(e, audio)}
				// onPointerMove={setTimerTooltip}
				ref={progressWrapperRef}
			>
				<span // Timer tooltip
					className={
						"group-hover:progress group-focus:progress " + isDurationValid
							? "hidden"
							: ""
					}
					ref={timeTooltipRef}
				/>

				<Progress />
			</div>

			<div className="flex justify-between items-center">
				<CurrentTime />

				<p className="text-icon-media-player font-primary tracking-wide text-center bg-transparent border-none">
					{formatedDuration}
				</p>
			</div>
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const percentageSelector = (state: ReturnType<typeof useProgress.getState>) =>
	state.percentage;

/////////////////////////////////////////

const Progress = () => {
	const percentage = useProgress(percentageSelector);
	document.documentElement.style.setProperty(
		"--progress-width",
		// !NaN => true (in case is not present), everything else is false:
		`${!percentage ? 0 : percentage}%`,
	);

	return (
		<div className={"relative bg-accent h-full w-[var(--progress-width)]"} />
	);
};

/////////////////////////////////////////

const currentTimeSelector = (state: ReturnType<typeof useProgress.getState>) =>
	state.currentTime;

/////////////////////////////////////////

const CurrentTime = () => {
	const currentTime = useProgress(currentTimeSelector);

	return <p>{formatDuration(currentTime)}</p>;
};
