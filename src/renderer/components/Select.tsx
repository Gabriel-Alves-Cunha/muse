import { useEffect, useRef } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { once, removeOn } from "@utils/window";
import { leftClick } from "./MediaListKind/Row";

export function Select({
	onPointerDownOutside,
	setIsOpen,
	isOpen,
	...contentProps
}: SelectProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function closeOnClickOutside(event: PointerEvent): void {
			// Assume that isOpen === true.

			// Check if click happened outside:
			if (
				event.button !== leftClick ||
				!contentRef.current ||
				contentRef.current.contains(event.target as Node)
			)
				return;

			onPointerDownOutside?.(event);

			setIsOpen?.(false);
		}

		function closeOnEscape(event: KeyboardEvent): void {
			// Assume that isOpen === true.

			if (event.key === "Escape" && !isAModifierKeyPressed(event))
				setIsOpen?.(false);
		}

		isOpen &&
			setTimeout(() => {
				// If I don't put a setTimeout, it just opens and closes!
				once("pointerup", closeOnClickOutside);
				once("keypress", closeOnEscape);
			}, 200);

		return () => {
			removeOn("pointerup", closeOnClickOutside);
			removeOn("keypress", closeOnEscape);
		};
	}, [isOpen, setIsOpen]);

	return isOpen ? (
		<div ref={contentRef} data-select-content {...contentProps} />
	) : null;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface SelectProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	onPointerDownOutside?(event: PointerEvent): void;
	isOpen: boolean;
}
