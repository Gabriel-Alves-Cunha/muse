import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { NumberOfMediasSelected } from "./NumberOfMediasSelected";
import { capitalizedAppName } from "@common/utils";
import { NumberOfMedias } from "./NumberOfMedias";
import { MediasInfo } from "@components/Decorations/MediasInfo";
import { RightSlot } from "./RightSlot";
import { LeftSlot } from "./LeftSlot";
import { usePage } from "@contexts/page";
import { t } from "@components/I18n";
import {
	toggleMaximize,
	minimizeWindow,
	closeWindow,
} from "./helper";

import imageUrl from "@assets/logo.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const DecorationsTop = () => (
	<header className="absolute flex -mt-[var(--top-decorations-height)] h-[var(--top-decorations-height)] w-screen bg-main app-drag-region">
		{/* ^ window-draggable-region */}
		<div className="flex justify-center items-center ml-2">
			<img
				alt={t("alts.museLogo")}
				src={imageUrl}
				height={24}
				width={24}
			/>
		</div>

		<AppNamePlusFolder />

		<Buttons />
	</header>
);

/////////////////////////////////////////////

export const DecorationsDown = () => (
	<footer className="relative flex justify-between items-center h-[var(--down-decorations-height)] w-screen bottom-0 select-none bg-scrollbar down-decorations-p">
		<LeftSlot>
			<NumberOfMedias />

			<MediasInfo />
		</LeftSlot>

		<RightSlot>
			<NumberOfMediasSelected />
		</RightSlot>
	</footer>
);

/////////////////////////////////////////////

const WindowButton = (
	{ className = "", children, ...props }: WindowButtonProps,
) => (
	<button
		className={"relative flex justify-center items-center h-[var(--top-decorations-height)] w-12 hover:bg-icon-button-hovered focus:bg-icon-button-hovered transition-none " +
			className}
		{...props}
	>
		{children}
	</button>
);

/////////////////////////////////////////////

const Buttons = () => (
	<div className="flex flex-row-reverse ml-auto h-full bg-none transition-none">
		<WindowButton
			className="hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
			title={t("tooltips.closeWindow")}
			onPointerUp={closeWindow}
		>
			<Close size={16} />
		</WindowButton>

		<WindowButton
			title={t("tooltips.toggleMaximizeWindow")}
			onPointerUp={toggleMaximize}
		>
			<Maximize size={16} />
		</WindowButton>

		<WindowButton
			title={t("tooltips.toggleMinimizeWindow")}
			onPointerUp={minimizeWindow}
		>
			<Minimize size={16} />
		</WindowButton>
	</div>
);

/////////////////////////////////////////////

function AppNamePlusFolder() {
	const { page } = usePage();

	return (
		<div className="absolute flex justify-center items-center h-full w-[20%] -translate-x-1/2 left-1/2 bg-transparent border-none whitespace-nowrap font-primary tracking-wide text-sm text-normal font-light sm:hidden">
			{capitalizedAppName} • {page}
		</div>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface WindowButtonProps
	extends React.BaseHTMLAttributes<HTMLButtonElement> {
	readonly children: React.ReactNode;
}
