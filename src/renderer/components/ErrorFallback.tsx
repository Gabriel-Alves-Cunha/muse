import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "@components/MediaListKind/helper";
import { BlurOverlay } from "./BlurOverlay";
import { Dialog } from "./Dialog";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const ErrorFallback: Component<{ description: string }> = (props) => {
	const [t] = useI18n();

	return (
		<Dialog.Content
			class="relative flex flex-col justify-center items-center"
			onOpenChange={() => {}}
			isOpen
			modal
		>
			<BlurOverlay />

			<h1 class="">{t("errors.mediaListKind.errorTitle")}</h1>

			<p class="text-alternative font-secondary tracking-wider font-medium overflow-ellipsis overflow-hidden">
				{props.description}
			</p>

			<Dialog.Close
				class="bg-[#94a59b] my-2 mx-0 text-black hover:bg-opacity-70 focus:bg-opacity-70"
				onPointerUp={() => {
					resetAllAppData();
					reloadWindow();
				}}
			>
				{t("buttons.resetAllAppData")}
			</Dialog.Close>

			<Dialog.Close
				class="bg-[#94a59b] text-black hover:bg-opacity-70 focus:bg-opacity-70"
				onPointerUp={reloadWindow}
			>
				{t("buttons.reloadWindow")}
			</Dialog.Close>
		</Dialog.Content>
	);
};
