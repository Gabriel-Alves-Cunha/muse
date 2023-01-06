import { useEffect, useReducer, useRef } from "react";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main functions:

const contentClass = "ctx-menu-content";

export function CtxMenu({
	contentClassName = "",
	ctxMenuContent,
	onContextMenu,
	onOpenChange,
	contentProps,
	children,
}: CtxMenuProps) {
	const [isOpen, setIsOpen] = useReducer(reducer, false);
	const contentRef = useRef<HTMLDivElement>(null);

	function reducer(_prevValue: boolean, newValue: boolean): boolean {
		onOpenChange?.(newValue);

		return newValue;
	}

	function handleOnCtxMenu(
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
	) {
		// Assume isOpen === false

		event.preventDefault();

		const contentEl = contentRef.current;
		if (!contentEl) return;

		const [normalizedX, normalizedY] = normalizePosition(event, contentEl);

		contentEl.style.left = `${normalizedX}px`;
		contentEl.style.top = `${normalizedY}px`;

		setIsOpen(true);

		onContextMenu?.(event);
	}

	useEffect(() => {
		function onDocumentClick(): void {
			// Assume that isOpen === true.
			// On click outside, close ctx menu:
			setIsOpen(false);
		}

		isOpen
			? setTimeout(
					// If I don't put a setTimeout, it just opens and closes!
					() => document.addEventListener("pointerup", onDocumentClick),
					200,
			  )
			: document.removeEventListener("pointerup", onDocumentClick);

		return () => document.removeEventListener("pointerup", onDocumentClick);
	}, [isOpen]);

	return (
		<div id="wrapper-trigger" onContextMenu={handleOnCtxMenu}>
			<div
				className={`${contentClass} ${contentClassName}`}
				data-is-open={isOpen}
				ref={contentRef}
				role="dialog"
				{...contentProps}
			>
				{ctxMenuContent}
			</div>

			{children}
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
	const { innerHeight: screenHeight, innerWidth: screenWidth } = window;

	// check if the element will go out of bounds
	const outOfBoundsOnX = pointerX + clientWidth > screenWidth;
	const outOfBoundsOnY = pointerY + clientHeight > screenHeight;

	const normalizedX = outOfBoundsOnX ? pointerX - clientWidth : pointerX;
	const normalizedY = outOfBoundsOnY ? pointerY - clientHeight : pointerY;

	return [normalizedX, normalizedY] as const;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface CtxMenuProps {
	contentProps?: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>;
	onContextMenu?: React.MouseEventHandler<HTMLDivElement> | undefined;
	onOpenChange?(newValue: boolean): void;
	contentClassName?: string | undefined;
	ctxMenuContent: React.ReactNode;
	children: React.ReactNode;
}
