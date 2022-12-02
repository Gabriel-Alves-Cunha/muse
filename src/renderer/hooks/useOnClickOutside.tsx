import { onCleanup, onMount } from "solid-js";

import { leftClick } from "@components/MediaListKind/helper";

export const useOnClickOutside = (
	ref: HTMLElement | null,
	onOutsideClick: (event: PointerEvent) => void
) => {
	const handleClickOutside = (event: PointerEvent) =>
		event.button !== leftClick &&
		!ref?.contains(event.target as Node) &&
		onOutsideClick(event);

	onMount(() =>
		document.addEventListener("pointerup", handleClickOutside, false)
	);

	onCleanup(() =>
		document.removeEventListener("pointerup", handleClickOutside, false)
	);
};
