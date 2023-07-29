import { useEffect, useReducer, useRef, useState } from "react";

import { on, removeOn } from "@utils/window";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main functions:

// Separated the wrapper and the ctxMenuContent
// so that when ctxMenuContent rerenders, the
// wrapper, with all of it's children, doesn't.
export const CtxMenu = ({
	onOpenChange,
	wrapperProps,
	children,
	...props
}: CtxMenuProps): JSX.Element => (
	<div data-ctx-menu-wrapper {...wrapperProps}>
		<CtxMenuContent onOpenChange={onOpenChange} {...props} />

		{children}
	</div>
);

/////////////////////////////////////////

function CtxMenuContent({
	ctxMenuContent,
	onOpenChange,
	...props
}: CtxMenuContentProps): JSX.Element {
	const [shouldClose, setShouldClose] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	const [isOpen, setIsOpen] = useReducer(
		(_prevValue: boolean, newValue: boolean): boolean => {
			onOpenChange?.(newValue);

			return newValue;
		},
		false,
	);

	useEffect(() => {
		const wrapper = contentRef.current?.parentElement as
			| HTMLDivElement
			| undefined
			| null;

		if (!wrapper) return;

		wrapper.oncontextmenu = (event) => {
			// Assume isOpen === false.

			// This prevents other ctx menus from opening:
			event.stopPropagation();

			const contentElement = contentRef.current;
			if (!contentElement) return;

			const [normalizedX, normalizedY] = normalizePosition(
				event,
				contentElement,
			);

			contentElement.style.left = `${normalizedX}px`;
			contentElement.style.top = `${normalizedY}px`;

			setShouldClose(false);
			setIsOpen(true);
		};
	}, []);

	useEffect(() => {
		function closeOnClickAnywhere(): void {
			if (!shouldClose) {
				setShouldClose(true);

				return;
			}

			setIsOpen(false);

			removeOn("pointerup", closeOnClickAnywhere);
		}

		on("pointerup", closeOnClickAnywhere);

		return () => removeOn("pointerup", closeOnClickAnywhere);
	}, [shouldClose]);

	return (
		<div
			className={isOpen ? "visible" : "invisible"}
			data-ctx-menu-content
			ref={contentRef}
			{...props}
		>
			{ctxMenuContent}
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function normalizePosition(
	{ clientX: pointerX, clientY: pointerY }: MouseEvent,
	{ clientHeight, clientWidth }: HTMLElement,
): readonly [normalizedX: number, normalizedY: number] {
	const { innerHeight, innerWidth } = window;

	// check if the element will go out of bounds
	const outOfBoundsOnY = pointerY + clientHeight > innerHeight;
	const outOfBoundsOnX = pointerX + clientWidth > innerWidth;

	const normalizedY = outOfBoundsOnY ? pointerY - clientHeight : pointerY;
	const normalizedX = outOfBoundsOnX ? pointerX - clientWidth : pointerX;

	return [normalizedX, normalizedY] as const;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

export interface CtxMenuProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	wrapperProps?:
		| React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLDivElement>,
				HTMLDivElement
		  >
		| undefined;
	onOpenChange?(newValue: boolean): void;
	ctxMenuContent: React.ReactNode;
	children: React.ReactNode;
	onContextMenu?: never;
}

/////////////////////////////////////////

interface CtxMenuContentProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	onOpenChange: ((newValue: boolean) => void) | undefined;
	ctxMenuContent: React.ReactNode;
	onContextMenu?: never;
}
