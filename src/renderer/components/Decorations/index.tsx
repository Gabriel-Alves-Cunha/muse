import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@common/utils";
import { Tooltip } from "@components";
import { usePage } from "@contexts";
import {
	toggleMaximize,
	minimizeWindow,
	closeWindow,
	imageUrl,
} from "./helper";

import {
	AppName_Folder_Wrapper,
	WindowButtons,
	WindowButton,
	AppIcon,
	Wrapper,
} from "./styles";

export const Decorations = () => (
	<Wrapper>
		{/* ^ window-draggable-region */}
		<AppIcon>
			<img src={imageUrl.href} width={24} height={24} alt="Muse's logo" />
		</AppIcon>

		<AppName_Folder />

		<Buttons />
	</Wrapper>
);

const Buttons = () => (
	<WindowButtons>
		<Tooltip text="Close window" arrow={false}>
			<WindowButton onClick={closeWindow} id="close">
				<Close size={16} />
			</WindowButton>
		</Tooltip>

		<Tooltip text="Toggle maximize window" arrow={false}>
			<WindowButton onClick={toggleMaximize}>
				<Maximize size={16} />
			</WindowButton>
		</Tooltip>

		<Tooltip text="Minimize window">
			<WindowButton onClick={minimizeWindow}>
				<Minimize size={16} />
			</WindowButton>
		</Tooltip>
	</WindowButtons>
);

const AppName_Folder = () => {
	const { page } = usePage();

	return (
		<AppName_Folder_Wrapper>
			{capitalizedAppName} {"\u279D"} {page}
		</AppName_Folder_Wrapper>
	);
};

Decorations.whyDidYouRender = {
	customName: "Decorations",
};
