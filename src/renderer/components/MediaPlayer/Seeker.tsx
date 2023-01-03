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
		if (!(audio?.src && progressElementRef.current)) return;

		const progressElement = progressElementRef.current;

		audio.ontimeupdate = () => {
			if (!isPointerOnSlider)
				progressElement.value = `${(audio.currentTime / audio.duration) * 100}`;

			// const currentTimeElement = currentTimeRef.current;
			// if (!currentTimeElement) return;
			// currentTimeElement.textContent = formatDuration(audio.currentTime);
		};

		audio.onchange = () => {
			const percentage = Number(progressElement.value) / 100;
			audio.currentTime = (audio.duration || 0) * percentage;
		};
	}, [audio]);

	useEffect(() => {
		if (
			!(
				progressWrapperRef.current &&
				timeTooltipRef.current &&
				isDurationValid &&
				audio?.src
			)
		)
			return;

		const timerTooltip = timeTooltipRef.current;
		const timeline = progressWrapperRef.current;

		function setTimerTooltip({ offsetX }: PointerEvent): void {
			if (!audio?.duration) return;

			const time =
				(offsetX / timeline.getBoundingClientRect().width) * audio.duration;
			const left = offsetX - 17.5; // 35 is the width of the tooltip, 17.5 is half.

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
	}, [audio, isDurationValid]);

	return (
		<div className="flex flex-col w-full gap-2">
			<div
				className={`group relative block w-full h-1 bg-main ${
					isDurationValid ? "cursor-pointer" : "cursor-default"
				}`}
				// onPointerUp={e => seek(e, audio)}
				// onPointerMove={setTimerTooltip}
				ref={progressWrapperRef}
			>
				<span // Timer tooltip
					className={`group-hover:progress group-focus:progress ${
						isDurationValid ? "hidden" : ""
					}`}
					ref={timeTooltipRef}
				/>

				<input
					className="relative bg-accent h-full progress"
					ref={progressElementRef}
					defaultValue="0"
					id="progress"
					type="range"
					max="100"
					step="1"
					min="0"
				/>
			</div>

			<div className="flex justify-between items-center text-icon-media-player font-primary text-center text-lg">
				<p ref={currentTimeRef}>00:00</p>

				<p>{formatedDuration}</p>
			</div>
		</div>
	);
}
