import type { Component, JSX } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { toggleMaximize, minimizeWindow, closeWindow } from "./helper";
import { NumberOfMediasSelected } from "./NumberOfMediasSelected";
import { capitalizedAppName } from "@common/utils";
import { CloseWindowIcon } from "@icons/CloseWindowIcon";
import { NumberOfMedias } from "./NumberOfMedias";
import { MinimizeIcon } from "@icons/MinimizeIcon";
import { MaximizeIcon } from "@icons/MaximizeIcon";
import { MediasInfo } from "../Decorations/MediasInfo";
import { usePage } from "@contexts/page";

import imageUrl from "@assets/logo.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const DecorationsTop: Component = () => {
	const { page } = usePage();
	const [t] = useI18n();

	return (
		<header class="absolute flex -mt-[var(--top-decorations-height)] h-[var(--top-decorations-height)] w-screen bg-main">
			{/* ^ window-draggable-region */}
			<div class="flex justify-center items-center ml-2">
				<img alt={t("alts.museLogo")} src={imageUrl} height={24} width={24} />
			</div>

			<div class="absolute flex justify-center items-center h-full w-[20%] -translate-x-1/2 left-1/2 bg-transparent border-none whitespace-nowrap font-primary tracking-wide text-sm text-normal font-light sm:hidden">
				{capitalizedAppName} • {page}
			</div>

			<Buttons />
		</header>
	);
};

/////////////////////////////////////////////

export const DecorationsDown: Component = () => (
	<footer class="decorations-down">
		<div class="decorations-down-left">
			<NumberOfMedias />

			<MediasInfo />
		</div>

		<div class="decorations-down-right">
			<NumberOfMediasSelected />
		</div>
	</footer>
);

/////////////////////////////////////////////

const WindowButton: Component<WindowButtonProps> = (props) => (
	<button
		class={`relative flex justify-center items-center h-[var(--top-decorations-height)] w-12 transition-none text-icon-window-button hover:bg-icon-button-hovered focus:bg-icon-button-hovered ${props.class}`}
		{...props}
	/>
);

/////////////////////////////////////////////

const Buttons: Component = () => {
	const [t] = useI18n();

	return (
		<div class="flex ml-auto h-full bg-transparent">
			<WindowButton
				title={t("tooltips.toggleMinimizeWindow")}
				onPointerUp={minimizeWindow}
			>
				<MinimizeIcon class="w-4 h-4" />
			</WindowButton>

			<WindowButton
				title={t("tooltips.toggleMaximizeWindow")}
				onPointerUp={toggleMaximize}
			>
				<MaximizeIcon class="w-4 h-4" />
			</WindowButton>

			<WindowButton
				class="hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white no-transition"
				title={t("tooltips.closeWindow")}
				onPointerUp={closeWindow}
			>
				<CloseWindowIcon class="w-4 h-4" />
			</WindowButton>
		</div>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type WindowButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;
