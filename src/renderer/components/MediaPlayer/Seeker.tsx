import type { RefToAudio } from "./ControlsAndSeeker";

import { useEffect, useMemo, useRef } from "react";

import { formatDuration, mapTo } from "@common/utils";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function SeekerWrapper({ audio }: RefToAudio) {
	const currentTimeRef = useRef<HTMLParagraphElement>(null);
	const progressElementRef = useRef<HTMLInputElement>(null);
	const progressWrapperRef = useRef<HTMLDivElement>(null);
	const timeTooltipRef = useRef<HTMLSpanElement>(null);
	const isPointerOnSlider = useRef(false);

	const { formatedDuration, isDurationValid } = useMemo(
		() => ({
			formatedDuration: formatDuration(audio?.duration),
			// @ts-ignore => It will give false if duration is undefined:
			isDurationValid: audio?.duration > 0,
		}),
		[audio?.duration],
	);

	useEffect(() => {
		const progressElement = progressElementRef.current;
		const timerTooltip = timeTooltipRef.current;
		const timeline = progressWrapperRef.current;

		if (!(timeline && timerTooltip && audio?.src && progressElement)) return;

		audio.ontimeupdate = () => {
			if (!isPointerOnSlider)
				progressElement.value = `${(audio.currentTime / audio.duration) * 100}`;

			const currentTimeElement = currentTimeRef.current;
			if (!currentTimeElement) return;
			currentTimeElement.textContent = formatDuration(audio.currentTime);
		};

		audio.onchange = () => {
			const percentage = Number(progressElement.value) / 100;
			audio.currentTime = (audio.duration || 0) * percentage;
		};

		function setTimerTooltip({ offsetX }: PointerEvent): void {
			if (!(audio?.duration && timeline && timerTooltip)) return;

			const time =
				(offsetX / timeline.getBoundingClientRect().width) * audio.duration;
			const left = offsetX - 17.5; // 17.5 is half the width of the tooltip.

			timerTooltip.textContent = formatDuration(time);
			timerTooltip.style.left = `${left}px`;
		}

		// 		function seek({ offsetX }: PointerEvent): void {
		// 			if (!(audio && isFinite(audio.duration))) return;
		//
		// 			const desiredTime =
		// 				(offsetX / timeline.getBoundingClientRect().width) * audio.duration;
		// 			const percentage = mapTo(desiredTime, [0, audio.duration], [0, 100]);
		//
		// 			useProgress.setState({ percentage });
		// 		}

		timeline.addEventListener("pointermove", setTimerTooltip);

		timeline.addEventListener("pointerdown", (e) => {
			// Make sure that event is captured even if pointer moves away from timeline rect bounds:
			timeline.setPointerCapture(e.pointerId);

			isPointerOnSlider.current = true;
			// seek(e);

			// timeline.addEventListener("pointermove", seek);
			timeline.addEventListener(
				"pointerup",
				(e) => {
					// timeline.removeEventListener("pointermove", seek);

					isPointerOnSlider.current = false;

					const desiredTime =
						(e.offsetX / timeline.getBoundingClientRect().width) *
						audio.duration;

					audio.currentTime = desiredTime;
				},
				{ once: true },
			);
		});
	}, [audio]);

	return (
		<div className="seeker-container">
			<div
				data-is-duration-valid={isDurationValid}
				// onPointerUp={e => seek(e, audio)}
				// onPointerMove={setTimerTooltip}
				className="seeker-wrapper"
				ref={progressWrapperRef}
			>
				<span // Timer tooltip
					data-hidden={isDurationValid}
					ref={timeTooltipRef}
				/>

				<input
					ref={progressElementRef}
					defaultValue="0"
					type="range"
					max="100"
					step="1"
					min="0"
				/>
			</div>

			<div className="seeker-info">
				<p ref={currentTimeRef}>00:00</p>

				<p>{formatedDuration}</p>
			</div>
		</div>
	);
}
