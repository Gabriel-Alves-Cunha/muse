import { onCleanup, onMount } from "solid-js";

import { LEFT_CLICK } from "@components/MediaListKind/helper";

export const useOnClickOutside = (
	ref: HTMLElement | undefined,
	onOutsideClick: (event: PointerEvent) => void,
) => {
	const handleClickOutside = (event: PointerEvent) => {
		if (
			event.button !== LEFT_CLICK &&
			!ref?.contains(event.currentTarget as Node)
		)
			onOutsideClick(event);
	};

	onMount(() =>
		document.addEventListener("pointerup", handleClickOutside, false),
	);

	onCleanup(() =>
		document.removeEventListener("pointerup", handleClickOutside, false),
	);
};
