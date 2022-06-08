import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@common/utils";
import { TooltipButton } from "@components/TooltipButton";
import { usePage } from "@contexts/page";
import {
	toggleMaximize,
	minimizeWindow,
	closeWindow,
	imageUrl,
} from "./helper";

import {
	AppName_Folder_Wrapper,
	WindowButtons,
	AppIcon,
	Wrapper,
} from "./styles";

export const Decorations = () => (
	<Wrapper>
		{/* ^ window-draggable-region */}
		<AppIcon>
			<img src={imageUrl.href} width={24} height={24} alt="Muse's logo" />
		</AppIcon>

		<AppNamePlusFolder />

		<Buttons />
	</Wrapper>
);

const Buttons = () => (
	<WindowButtons>
		<TooltipButton
			tooltip-side="left-bottom"
			tooltip="Close window"
			onClick={closeWindow}
			type="button"
			id="close"
		>
			<Close size={16} />
		</TooltipButton>

		<TooltipButton
			tooltip="Toggle maximize window"
			tooltip-side="left-bottom"
			onClick={toggleMaximize}
			type="button"
		>
			<Maximize size={16} />
		</TooltipButton>

		<TooltipButton
			tooltip="Minimize window"
			onClick={minimizeWindow}
			type="button"
		>
			<Minimize size={16} />
		</TooltipButton>
	</WindowButtons>
);

function AppNamePlusFolder() {
	const { page } = usePage();

	return (
		<AppName_Folder_Wrapper>
			{capitalizedAppName} • {page}
		</AppName_Folder_Wrapper>
	);
}
