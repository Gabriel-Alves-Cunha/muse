import { useEffect, useRef, useState } from "react";

import { formatDuration } from "@common/utils";
import { ControlsProps } from "./ControlsAndSeeker/Controls";
import { getAudio } from "@contexts/useCurrentPlaying";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

let timeUpdate: NodeJS.Timer | undefined;

export function SeekerWrapper({ isThereAMedia }: ControlsProps) {
	const currentTimeRef = useRef<HTMLParagraphElement>(null);
	const timelineRef = useRef<HTMLDivElement>(null);
	const [[formatedDuration, isDurationValid], setIsAudioAvailable] = useState([
		"00:00",
		false,
	]);

	useEffect(() => {
		const timeline = timelineRef.current;
		const audio = getAudio();
		if (!(audio && timeline)) return;

		/////////////////////////////////////////
		/////////////////////////////////////////

		audio.addEventListener("loadeddata", setAudioAvailability);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("playing", onPlaying);

		timeline.addEventListener("pointerdown", handleOnPointerDown);
		timeline.addEventListener("pointerenter", setTooltipTimeOnHover);

		return () => {
			audio.removeEventListener("loadeddata", setAudioAvailability);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("playing", onPlaying);

			timeline.removeEventListener("pointerdown", handleOnPointerDown);
			timeline.removeEventListener("pointerenter", setTooltipTimeOnHover);
		};

		/////////////////////////////////////////
		/////////////////////////////////////////

		function onPause() {
			clearInterval(timeUpdate);
		}

		function onPlaying(): void {
			// The playing event is fired after playback is first started, and whenever it is restarted. For example it is fired when playback resumes after having been paused or delayed due to lack of data.

			onPause();

			timeUpdate = setInterval(setTimeText, 1_000);
		}

		function setTimeText(): void {
			const timeElement = currentTimeRef.current;
			if (!(timeElement && timeline && audio)) return;

			const percentage = `${(audio.currentTime / audio.duration) * 100}%`;

			timeline.style.setProperty("--bg-handle-width", percentage);
			timeline.style.setProperty("--handle-position", percentage);

			timeElement.textContent = formatDuration(audio.currentTime);
		}

		/////////////////////////////////////////
		/////////////////////////////////////////

		function setTooltipTimeOnHover(event: PointerEvent): void {
			if (!timeline) return;

			// Make so that all and any poiter events on the entire screen happens on timeline:
			timeline.setPointerCapture(event.pointerId);

			timeline.addEventListener("pointermove", seek);

			timeline.addEventListener(
				"pointerleave",
				() => {
					timeline.removeEventListener("pointermove", seek);
				},
				{ once: true },
			);
		}

		/////////////////////////////////////////
		/////////////////////////////////////////

		function setAudioAvailability() {
			const formatedDuration = formatDuration(audio?.duration);
			// @ts-ignore => It will give false if duration is undefined:
			const isDurationValid = audio?.duration > 0;

			setIsAudioAvailable([formatedDuration, isDurationValid]);
		}

		/////////////////////////////////////////
		/////////////////////////////////////////

		function setTimelinePosition({ offsetX }: PointerEvent): void {
			if (!(timeline && audio)) return;

			const { width } = timeline.getBoundingClientRect();

			if (offsetX > width) offsetX = width;
			if (offsetX < 0) offsetX = 0;

			const progress_0_to_1 = offsetX / width;
			const percentageString = `${progress_0_to_1 * 100}%`;

			timeline.style.setProperty("--bg-handle-width", percentageString);
			timeline.style.setProperty("--handle-position", percentageString);

			audio.currentTime = progress_0_to_1 * audio.duration;

			setTimeText();
		}

		/////////////////////////////////////////
		/////////////////////////////////////////

		function seek({ offsetX }: PointerEvent): void {
			if (!(timeline && audio?.duration)) return;

			const { width } = timeline.getBoundingClientRect();

			if (offsetX > width) offsetX = width;
			if (offsetX < 0) offsetX = 0;

			const left = `${offsetX - 17.5}px`; // 17.5 is half the width of the tooltip.
			const time_ms = (offsetX / width) * audio.duration;

			timeline.setAttribute("data-tooltip-time", formatDuration(time_ms));
			timeline.style.setProperty("--tooltip-position", left);
			(timeline.firstElementChild as HTMLDivElement).style.setProperty(
				"--handle-position-when-seeking",
				`${offsetX}px`,
			);
		}

		/////////////////////////////////////////
		/////////////////////////////////////////

		function handleOnPointerDown(event: PointerEvent): void {
			if (!timeline) return;

			// Make so that all and any poiter events on the entire screen happens on timeline:
			timeline.setPointerCapture(event.pointerId);

			timeline.addEventListener("pointermove", seek);

			timeline.addEventListener(
				"pointerup",
				(e) => {
					timeline.removeEventListener("pointermove", seek);

					setTimelinePosition(e);
				},
				{ once: true },
			);
		}
	}, [isThereAMedia]);

	/////////////////////////////////////////
	/////////////////////////////////////////
	/////////////////////////////////////////

	return (
		<div className="timeline-container">
			<div
				data-is-duration-valid={isDurationValid}
				className="timeline"
				ref={timelineRef}
			>
				<div />
			</div>

			<div className="timeline-info">
				<p ref={currentTimeRef}>00:00</p>

				<p>{formatedDuration}</p>
			</div>
		</div>
	);
}
