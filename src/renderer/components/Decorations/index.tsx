import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@common/utils";
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
			<img src={imageUrl.href} width="24px" height="24px" alt="Muse's logo" />
		</AppIcon>

		<AppName_Folder />

		<Buttons />
	</Wrapper>
);

const Buttons = () => (
	<WindowButtons>
		<WindowButton
			aria-label="Close window"
			onClick={closeWindow}
			className="close"
		>
			<Close size="16px" />
		</WindowButton>

		<WindowButton aria-label="Toggle maximize window" onClick={toggleMaximize}>
			<Maximize size="16px" />
		</WindowButton>

		<WindowButton onClick={minimizeWindow} aria-label="Minize window">
			<Minimize size="16px" />
		</WindowButton>
	</WindowButtons>
);

function AppName_Folder() {
	const { page } = usePage();

	return (
		<AppName_Folder_Wrapper>
			{capitalizedAppName} {"\u279D"} {page}
		</AppName_Folder_Wrapper>
	);
}
