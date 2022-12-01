import type { Component, JSX } from "solid-js";

import { createSignal, createEffect } from "solid-js";

import { CloseIcon } from "@icons/CloseIcon";

export const Dialog: Component<DialogProps> = (props) => {
	const dialog = (
		<dialog class={`dialog ${props.class ?? ""}`} {...props}>
			<button
				class="dialog-close-button"
				onPointerUp={closeDialog}
				type="button"
			>
				<CloseIcon class="w-3 h-3 fill-black" />
			</button>

			{props.children}
		</dialog>
	) as HTMLDialogElement;

	function closeDialog() {
		props.onOpenChange(false);
		dialog.close();
	}

	createEffect(() => {
		if (props.isOpen) dialog.show();
	});

	return dialog;
};

interface DialogProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	onOpenChange(newIsOpen: boolean): void;
	children?: JSX.Element;
	isOpen: boolean;
}
