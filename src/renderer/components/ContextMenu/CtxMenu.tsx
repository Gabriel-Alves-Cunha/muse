import { useEffect, useReducer, useRef } from "react";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main functions:

const contentClass = "ctx-menu-content";

export function CtxMenu({
	ctxMenuContent,
	onOpenChange,
	children,
	...props
}: CtxMenuProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);

	return (
		<div ref={wrapperRef}>
			<CtxMenuContent
				ctxMenuContent={ctxMenuContent}
				onOpenChange={onOpenChange}
				wrapperRef={wrapperRef}
				{...props}
			/>

			{children}
		</div>
	);
}

/////////////////////////////////////////

function CtxMenuContent({
	className = "",
	ctxMenuContent,
	onContextMenu,
	onOpenChange,
	wrapperRef,
	...props
}: CtxMenuContentProps) {
	const [isOpen, setIsOpen] = useReducer(reducer, false);
	const contentRef = useRef<HTMLDivElement>(null);

	function reducer(_prevValue: boolean, newValue: boolean): boolean {
		onOpenChange?.(newValue);

		return newValue;
	}

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		(wrapper.oncontextmenu as
			| ((
					this: GlobalEventHandlers,
					ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
			  ) => void)
			| null) = (event) => {
			// Assume isOpen === false

			event.preventDefault();

			const contentEl = contentRef.current;
			if (!contentEl) return;

			const [normalizedX, normalizedY] = normalizePosition(event, contentEl);

			contentEl.style.left = `${normalizedX}px`;
			contentEl.style.top = `${normalizedY}px`;

			onContextMenu?.(event);
			setIsOpen(true);
		};
	}, [setIsOpen]);

	useEffect(
		// On click outside, close ctx menu:
		() => {
			function closeOnClickAnywhere(): void {
				// Assume that isOpen === true.
				setIsOpen(false);
			}

			isOpen &&
				setTimeout(
					// If I don't put a setTimeout, it just opens and closes!
					() =>
						document.addEventListener("pointerup", closeOnClickAnywhere, {
							once: true,
						}),
					200,
				);

			return () =>
				document.removeEventListener("pointerup", closeOnClickAnywhere);
		},
		[isOpen],
	);

	return (
		<div
			className={`${contentClass} ${className}`}
			data-is-open={isOpen}
			ref={contentRef}
			role="dialog"
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
	{
		clientX: pointerX,
		clientY: pointerY,
	}: React.MouseEvent<HTMLDivElement, MouseEvent>,
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
	onOpenChange?(newValue: boolean): void;
	ctxMenuContent: React.ReactNode;
	children: React.ReactNode;
}

/////////////////////////////////////////

interface CtxMenuContentProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	wrapperRef: React.RefObject<HTMLDivElement>;
	onOpenChange?(newValue: boolean): void;
	ctxMenuContent: React.ReactNode;
}
