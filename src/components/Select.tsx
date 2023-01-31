import { useEffect, useRef } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { on, removeOn } from "@utils/window";
import { leftClick } from "./MediaListKind/Row";

export function Select({
	onPointerDownOutside,
	setIsOpen,
	onEscape,
	isOpen,
	...contentProps
}: SelectProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function closeOnClickOutside(event: MouseEvent): void {
			// Assume that isOpen === true.

			// Check if click happened outside:
			if (
				event.button !== leftClick ||
				!contentRef.current ||
				contentRef.current.contains(event.target as Node)
			)
				return;

			event.stopImmediatePropagation();

			onPointerDownOutside?.(event);
			setIsOpen?.(false);
		}

		function closeOnEscape(event: KeyboardEvent): void {
			// Assume that isOpen === true.

			if (event.key === "Escape" && !isAModifierKeyPressed(event)) {
				event.stopImmediatePropagation();

				setIsOpen?.(false);
				onEscape?.();
			}
		}

		isOpen &&
			setTimeout(() => {
				// If I don't put a setTimeout, it just opens and closes!
				on("click", closeOnClickOutside);
				on("keyup", closeOnEscape);
			}, 200);

		return () => {
			removeOn("click", closeOnClickOutside);
			removeOn("keyup", closeOnEscape);
		};
	}, [isOpen]);

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
	onPointerDownOutside?(event: MouseEvent): void;
	onEscape?(): void;
	isOpen: boolean;
}
