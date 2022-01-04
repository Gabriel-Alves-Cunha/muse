import { useCallback, useLayoutEffect, useRef } from "react";

/**
 *  To use this with absolute/sticky elements, on the element's css do:
 * ```css
 * 	[data-scroll-lock] .my-element {
 * 		margin-right: var(--scrollbar-compensation);
 *	}
 *	```
 */
export function useScrollLock() {
	const scrollOffset = useRef(0);
	const is_iOS = isIOS();

	const lockScroll = useCallback(() => {
		document.body.style.paddingRight = `var(${scrollBarCompensationName})`;
		document.body.dataset.scrollLock = "true";
		document.body.style.overflow = "hidden";

		if (is_iOS) {
			scrollOffset.current = window.pageYOffset;

			document.body.style.top = `-${scrollOffset.current}px`;
			document.body.style.position = "fixed";
			document.body.style.width = "100%";
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const unlockScroll = useCallback(() => {
		document.body.style.paddingRight = "";
		document.body.style.overflow = "";

		if (is_iOS) {
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.style.top = "";

			window.scrollTo(0, scrollOffset.current);
		}

		delete document.body.dataset.scrollLock;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useLayoutEffect(() => {
		const scrollBarCompensation = window.innerWidth - document.body.offsetWidth;

		document.body.style.setProperty(
			`${scrollBarCompensationName}`,
			`${scrollBarCompensation}px`
		);
	}, []);

	return { lockScroll, unlockScroll } as const;
}

function isIOS() {
	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod",
		].includes(navigator.platform) ||
		// iPad on IOS 13 detection
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
	);
}

const scrollBarCompensationName = "--scrollbar-compensation";
