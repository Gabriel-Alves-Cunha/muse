import {
	type Component,
	type JSX,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { useOnClickOutside } from "@hooks/useOnClickOutside";

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

	const setOnOpenChangeToFalse = () => props.onOpenChange(false);

	const closeDialogOnEsc = (e: KeyboardEvent) =>
		!isAModifierKeyPressed(e) &&
		e.key === "Escape" &&
		props.isOpen &&
		isOnFocus() &&
		closeDialog(e);

	/////////////////////////////////////////////
	// Listeners

	onMount(() => {
		document.addEventListener("keyup", closeDialogOnEsc);

		dialog.addEventListener("close", setOnOpenChangeToFalse);

		useOnClickOutside(dialog, (e) => {
			closeDialog(e);
			props.onClickOutside?.(e);
		});
	});

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
		type="button"
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
	onClickOutside?(e: PointerEvent): void;
	children: JSX.Element;
	isOpen: boolean;
	modal?: boolean;
}
