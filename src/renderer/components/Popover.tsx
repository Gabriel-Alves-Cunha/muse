import { useEffect } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { on, removeOn } from "@utils/window";
import { leftClick } from "./MediaListKind/Row";

export function Popover({
	onPointerDownOutside,
	contentRef,
	setIsOpen,
	onEscape,
	size,
	...contentProps
}: PopoverProps) {
	useEffect(() => {
		function closeOnEscape(event: KeyboardEvent): void {
			// Assume that isOpen === true.

			if (event.key === "Escape" && !isAModifierKeyPressed(event)) {
				event.stopImmediatePropagation();

				setIsOpen?.(false);
				onEscape?.();
			}
		}

		function closeOnClickOutside(event: PointerEvent): void {
			// Assume that isOpen === true.

			const ignoreBecauseOfLeftClick = event.button !== leftClick;
			const wasClickInside = Boolean(
				contentRef.current?.contains(event.target as Node),
			);

			if (ignoreBecauseOfLeftClick || wasClickInside) return;

			event.stopImmediatePropagation();

			onPointerDownOutside?.(event);
			setIsOpen?.(false);
		}

		on("pointerup", closeOnClickOutside);
		on("keyup", closeOnEscape);

		return () => {
			removeOn("pointerup", closeOnClickOutside);
			removeOn("keyup", closeOnEscape);
		};
	}, []);

	return (
		<div data-popover-size={size} data-popover-content {...contentProps} />
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface PopoverProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	size:
		| "nothing-found-for-convertions-or-downloads"
		| "nothing-found-for-search-media"
		| "convertions-or-downloads"
		| "search-media-results";
	setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	onPointerDownOutside?(event: PointerEvent): void;
	contentRef: React.RefObject<HTMLElement>;
	onEscape?(): void;
}
