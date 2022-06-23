import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@common/utils";
import { usePage } from "@contexts/page";
import {
	toggleMaximize,
	minimizeWindow,
	closeWindow,
	imageUrl,
} from "./helper";

import {
	AppName_Folder_Wrapper,
	WindowButtonsWrapper,
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

		<AppNamePlusFolder />

		<Buttons />
	</Wrapper>
);

const Buttons = () => (
	<WindowButtonsWrapper className="notransition">
		<WindowButton
			data-tip="Close window"
			onClick={closeWindow}
			data-place="left"
			id="close"
		>
			<Close size={16} />
		</WindowButton>

		<WindowButton
			data-tip="Toggle maximize window"
			onClick={toggleMaximize}
			data-place="left"
		>
			<Maximize size={16} />
		</WindowButton>

		<WindowButton data-tip="Minimize window" onClick={minimizeWindow}>
			<Minimize size={16} />
		</WindowButton>
	</WindowButtonsWrapper>
);

function AppNamePlusFolder() {
	const { page } = usePage();

	return (
		<AppName_Folder_Wrapper>
			{capitalizedAppName} • {page}
		</AppName_Folder_Wrapper>
	);
}
