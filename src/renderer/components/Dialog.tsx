import {
	type Component,
	type Setter,
	type JSX,
	onCleanup,
	onMount,
	Switch,
	Match,
} from "solid-js";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { BlurOverlay, Overlay } from "./BlurOverlay";
import { useOnClickOutside } from "@hooks/useOnClickOutside";

export const Dialog: Component<DialogRootProps> = (props) => {
	let dialogRef: HTMLDialogElement | undefined;

	/////////////////////////////////////////////
	// Functions:

	const setOnOpenChangeToFalse = () => props.setIsOpen(false);

	const closeDialogOnEsc = (e: KeyboardEvent) => {
		if (e.key === "Escape" && !isAModifierKeyPressed(e) && props.isOpen) {
			e.stopPropagation(); // There may be more than one dialog open.
			closeDialog(dialogRef);
		}
	};

	/////////////////////////////////////////////
	// Listeners

	onMount(() => {
		document.addEventListener("keyup", closeDialogOnEsc);

		dialogRef!.addEventListener("close", setOnOpenChangeToFalse);

		useOnClickOutside(dialogRef, (e) => {
			closeDialog(dialogRef);
			props.onClickOutside?.(e);
		});
	});

	onCleanup(() => {
		dialogRef!.removeEventListener("close", setOnOpenChangeToFalse);

		document.removeEventListener("keyup", closeDialogOnEsc);
	});

	return (
		<>
			<Switch>
				<Match when={props.overlay === "blur"}>
					<BlurOverlay />
				</Match>

				<Match when={props.overlay === "dim"}>
					<Overlay />
				</Match>
			</Switch>

			<dialog
				class={`dialog ${props.class ?? ""}`}
				ref={dialogRef as HTMLDialogElement}
				aria-modal={Boolean(props.modal)}
				open={props.isOpen}
				{...props}
			>
				{props.children}
			</dialog>
		</>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

// Close the closest dialog element:
const closeDialog = (dialogRef: HTMLDialogElement | undefined): void =>
	dialogRef?.close();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface DialogRootProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	onClickOutside?(e: PointerEvent): void;
	setIsOpen: Setter<boolean>;
	overlay?: "blur" | "dim";
	children: JSX.Element;
	isOpen: boolean;
	modal?: boolean;
}
