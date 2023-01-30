import { useEffect, useRef } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { on, removeOn } from "@utils/window";

export function Popover({
	onPointerDownOutside,
	setIsOpen,
	onEscape,
	isOpen,
	size,
	...contentProps
}: PopoverProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function closeOnEscape(event: KeyboardEvent): void {
			// Assume that isOpen === true.

			if (event.key === "Escape" && !isAModifierKeyPressed(event)) {
				event.stopImmediatePropagation();

				setIsOpen?.(false);
				onEscape?.();
			}
		}

		function closeOnClickOutside(event: MouseEvent): void {
			// Assume that isOpen === true.

			if (contentRef.current?.contains(event.target as Node))
				// Check if click happened outside:
				return;

			event.stopImmediatePropagation();

			onPointerDownOutside?.(event);
			setIsOpen?.(false);
		}

		isOpen &&
			setTimeout(() => {
				on("click", closeOnClickOutside);
				on("keyup", closeOnEscape);
			}, 200);

		return () => {
			removeOn("click", closeOnClickOutside);
			removeOn("keyup", closeOnEscape);
		};
	}, [isOpen]);

	return isOpen ? (
		<div
			data-popover-size={size}
			data-popover-content
			ref={contentRef}
			{...contentProps}
		/>
	) : null;
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
	onPointerDownOutside?(event: MouseEvent): void;
	onEscape?(): void;
	isOpen: boolean;
}
