import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { toggleMaximize, minimizeWindow, closeWindow } from "./helper";
import { NumberOfMediasSelected } from "./NumberOfMediasSelected";
import { selectT, useTranslator } from "@i18n";
import { capitalizedAppName } from "@common/utils";
import { NumberOfMedias } from "./NumberOfMedias";
import { MediasInfo } from "../Decorations/MediasInfo";
import { pageRef } from "@contexts/page";

// @ts-ignore => This is ok:
import imageUrl from "@assets/logo.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

// Window draggable region:
export function DecorationsTop(): JSX.Element {
	const t = useTranslator(selectT);

	return (
		<header className="decorations-up">
			<img alt={t("alts.museLogo")} src={imageUrl} height={24} width={24} />

			<AppNamePlusFolder />

			<Buttons />
		</header>
	);
}

/////////////////////////////////////////////

export const DecorationsDown = (): JSX.Element => (
	<footer className="decorations-down">
		<div>
			<NumberOfMedias />

			<MediasInfo />
		</div>

		<div>
			<NumberOfMediasSelected />
		</div>
	</footer>
);

/////////////////////////////////////////////

const WindowButton = (props: WindowButtonProps): JSX.Element => (
	<button data-window-button type="button" {...props} />
);

/////////////////////////////////////////////

function Buttons(): JSX.Element {
	const t = useTranslator(selectT);

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
				className="hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
				title={t("tooltips.closeWindow")}
				onPointerUp={closeWindow}
			>
				<Close size={16} />
			</WindowButton>
		</div>
	);
}

/////////////////////////////////////////////

function AppNamePlusFolder(): JSX.Element {
	const page = pageRef().current;

	return (
		<div className="app-name-plus-folder">
			{capitalizedAppName} • {page}
		</div>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type WindowButtonProps = React.BaseHTMLAttributes<HTMLButtonElement>;
