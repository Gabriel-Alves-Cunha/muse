import type { Component, Setter } from "solid-js";

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
	handleMediaDeletion(): void;
	setIsOpen: Setter<boolean>;
	isOpen: boolean;
}> = (props) => {
	const [t] = useI18n();

	return (
		<Portal>
			<Dialog setIsOpen={props.setIsOpen} isOpen={props.isOpen} class="" modal>
				<BlurOverlay />

				<h1 class="text-lg first-letter:text-3xl first-letter:font-normal">
					{t("dialogs.deleteMedia.subtitle")}
				</h1>

				<FlexRow>
					<img class="" src={warningSvg} alt="Warning sign." />

					<button
						class="bg-red-600 text-white hover:bg-opacity-70 focus:bg-opacity-70"
						onPointerUp={() => {
							props.handleMediaDeletion();
							props.setIsOpen(false);
						}}
						type="button"
					>
						{t("buttons.confirm")}
					</button>

					<button
						class="bg-transparent text-green-400 hover:bg-opacity-70 focus:bg-opacity-70"
						onPointerUp={() => props.setIsOpen(false)}
						type="button"
					>
						{t("buttons.cancel")}
					</button>
				</FlexRow>
			</Dialog>
		</Portal>
	);
};
