import { Component, createSignal, JSX, onCleanup } from "solid-js";

import { isAModifierKeyPressed } from "@utils/keyboard";

const Content: Component<DialogRootProps> = (props) => {
	const [isOnFocus, setIsOnFocus] = createSignal(false);

	const dialog = (
		<dialog
			class={`dialog ${props.class ?? ""}`}
			onFocus={() => setIsOnFocus(true)}
			onBlur={() => setIsOnFocus(false)}
			aria-modal={Boolean(props.modal)}
			open={props.isOpen}
			{...props}
		/>
	) as HTMLDialogElement;

	/////////////////////////////////////////////
	// Functions:

	function setOnOpenChangeToFalse() {
		props.onOpenChange(false);
	}

	function closeDialogOnEsc(e: KeyboardEvent) {
		if (
			!isAModifierKeyPressed(e) &&
			e.key === "Escape" &&
			props.isOpen &&
			isOnFocus()
		)
			closeDialog(e);
	}

	/////////////////////////////////////////////
	// Listeners

	document.addEventListener("keyup", closeDialogOnEsc);

	dialog.addEventListener("close", setOnOpenChangeToFalse);

	onCleanup(() => {
		dialog.removeEventListener("close", setOnOpenChangeToFalse);

		document.removeEventListener("keyup", closeDialogOnEsc);
	});

	return dialog;
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const Close: Component<CloseDialogProps> = (props) => (
	<button
		class={`close-dialog ${props.class ?? ""}`}
		onPointerUp={closeDialog}
		{...props}
	/>
);

/////////////////////////////////////////////

// Close the closest dialog element:
const closeDialog = (e: PointerEvent | KeyboardEvent) =>
	(e.target as HTMLElement).closest("dialog")!.close();

/////////////////////////////////////////////

export const Dialog = {
	Content,
	Close,
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface CloseDialogProps
	extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}

/////////////////////////////////////////////

interface DialogRootProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	onOpenChange(newIsOpen: boolean): void;
	children: JSX.Element;
	isOpen: boolean;
	modal?: boolean;
}
