import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";
import { Portal } from "solid-js/web";

import { BlurOverlay } from "./BlurOverlay";
import { FlexRow } from "./FlexRow";
import { Dialog } from "./Dialog";

import warningSvg from "@assets/warning.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const DeleteMediaDialog: Component<{
	onOpenChange(newIsOpen: boolean): void;
	handleMediaDeletion: () => void;
	isOpen: boolean;
}> = (props) => {
	const [t] = useI18n();

	return (
		<Portal>
			<Dialog.Content
				onOpenChange={props.onOpenChange}
				isOpen={props.isOpen}
				class=""
			>
				<BlurOverlay />

				<h1 class="text-lg first-letter:text-3xl first-letter:font-normal">
					{t("dialogs.deleteMedia.subtitle")}
				</h1>

				<FlexRow>
					<img class="" src={warningSvg} alt="Warning sign." />

					<Dialog.Close
						class="bg-red-600 text-white hover:bg-opacity-70 focus:bg-opacity-70"
						onPointerUp={props.handleMediaDeletion}
					>
						{t("buttons.confirm")}
					</Dialog.Close>

					<Dialog.Close class="bg-transparent text-green-400 hover:bg-opacity-70 focus:bg-opacity-70">
						{t("buttons.cancel")}
					</Dialog.Close>
				</FlexRow>
			</Dialog.Content>
		</Portal>
	);
};
