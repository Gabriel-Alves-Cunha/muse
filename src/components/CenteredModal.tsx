import { useEffect, useRef } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { on, removeOn } from "@utils/window";

export function CenteredModal({
	onPointerDownOutside,
	wrapperProps,
	setIsOpen,
	onEscape,
	isOpen,
	...contentProps
}: CenteredModalProps) {
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

			// Check if click happened outside:
			if (contentRef.current?.contains(event.target as Node)) return;

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
		<div data-modal-content-wrapper {...wrapperProps}>
			<div ref={contentRef} data-modal-content {...contentProps} />
		</div>
	) : null;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface CenteredModalProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	onPointerDownOutside?(event: MouseEvent): void;
	wrapperProps?:
		| React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLDivElement>,
				HTMLDivElement
		  >
		| undefined;
	setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	onEscape?(): void;
	isOpen: boolean;
}
