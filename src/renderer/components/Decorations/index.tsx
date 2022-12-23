import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { toggleMaximize, minimizeWindow, closeWindow } from "./helper";
import { NumberOfMediasSelected } from "./NumberOfMediasSelected";
import { capitalizedAppName } from "@common/utils";
import { NumberOfMedias } from "./NumberOfMedias";
import { useTranslation } from "@i18n";
import { MediasInfo } from "@components/Decorations/MediasInfo";
import { usePage } from "@contexts/page";

// @ts-ignore => This is ok:
import imageUrl from "@assets/logo.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function DecorationsTop() {
	const { t } = useTranslation();

	return (
		<header className="relative flex h-[var(--top-decorations-height)] w-screen bg-main app-drag-region">
			{/*    ^ window-draggable-region */}
			<div className="flex justify-center items-center ml-2">
				<img alt={t("alts.museLogo")} src={imageUrl} height={24} width={24} />
			</div>

			<AppNamePlusFolder />

			<Buttons />
		</header>
	);
}

/////////////////////////////////////////////

export const DecorationsDown = () => (
	<footer className="decorations-down">
		<div className="decorations-down-left">
			<NumberOfMedias />

			<MediasInfo />
		</div>

		<div className="decorations-down-right">
			<NumberOfMediasSelected />
		</div>
	</footer>
);

/////////////////////////////////////////////

const WindowButton = ({ className = "", ...props }: WindowButtonProps) => (
	<button
		className={`relative flex justify-center items-center h-[var(--top-decorations-height)] w-12 transition-none text-icon-window-button hover:bg-icon-button-hovered focus:bg-icon-button-hovered ${className}`}
		{...props}
	/>
);

/////////////////////////////////////////////

function Buttons() {
	const { t } = useTranslation();

	return (
		<div className="flex ml-auto h-full bg-transparent">
			<WindowButton
				title={t("tooltips.toggleMinimizeWindow")}
				onPointerUp={minimizeWindow}
			>
				<Minimize size={16} />
			</WindowButton>

			<WindowButton
				title={t("tooltips.toggleMaximizeWindow")}
				onPointerUp={toggleMaximize}
			>
				<Maximize size={16} />
			</WindowButton>

			<WindowButton
				className="hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white no-transition"
				title={t("tooltips.closeWindow")}
				onPointerUp={closeWindow}
			>
				<Close size={16} />
			</WindowButton>
		</div>
	);
}

/////////////////////////////////////////////

function AppNamePlusFolder() {
	const { page } = usePage();

	return (
		<div className="absolute hidden sm:flex justify-center items-center h-full w-[20%] -translate-x-1/2 left-1/2 bg-transparent border-none whitespace-nowrap font-primary tracking-wide text-sm text-normal font-light">
			{capitalizedAppName} • {page}
		</div>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type WindowButtonProps = React.BaseHTMLAttributes<HTMLButtonElement>;
