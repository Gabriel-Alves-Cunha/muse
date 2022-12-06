import { Component, createSignal } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "./MediaListKind/helper";
import { Dialog } from "./Dialog";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const [, noop_setIsOpen] = createSignal(false);

export const ErrorFallback: Component<{ description: string }> = (props) => {
	const [t] = useI18n();

	return (
		<Dialog
			class="relative flex flex-col justify-center items-center"
			setIsOpen={noop_setIsOpen}
			overlay="blur"
			isOpen
			modal
		>
			<h1 class="">{t("errors.mediaListKind.errorTitle")}</h1>

			<p class="text-alternative font-secondary tracking-wider font-medium overflow-ellipsis overflow-hidden">
				{props.description}
			</p>

			<button
				class="bg-[#94a59b] my-2 mx-0 text-black hover:bg-opacity-70 focus:bg-opacity-70"
				onPointerUp={() => {
					resetAllAppData();
					reloadWindow();
				}}
				type="button"
			>
				{t("buttons.resetAllAppData")}
			</button>

			<button
				class="bg-[#94a59b] text-black hover:bg-opacity-70 focus:bg-opacity-70"
				onPointerUp={reloadWindow}
				type="button"
			>
				{t("buttons.reloadWindow")}
			</button>
		</Dialog>
	);
};
