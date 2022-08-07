import { type RefObject, useEffect } from "react";

import { leftClick } from "@components/MediaListKind/helper";

/**
 * It's worth noting that because passed in `handler` is a new
 * function on every render, that will cause this effect
 * callback/cleanup to run every render. It's not a big deal
 * but to optimize you can wrap `handler` in `useCallback` before
 * passing it into this hook.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T>,
	handler: Handler,
) {
	useEffect(() => {
		function listener(event: MouseEvent) {
			if (event.button !== leftClick) return;

			const el = ref.current;

			// Do nothing if clicking ref's element or descendent elements
			if (!el || el.contains(event.target as Node)) return;

			handler(event);
		}

		document.addEventListener("mousedown", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
		};
	}, [ref, handler]);
}

type Handler = (event: MouseEvent | TouchEvent) => void;
