import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@common/utils";
import { MediasInfo } from "@components/MediasInfo";
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
	DownWrapper,
	TopWrapper,
	AppIcon,
	LeftSlot,
	RightSlot,
} from "./styles";

export const DecorationsTop = () => (
	<TopWrapper>
		{/* ^ window-draggable-region */}
		<AppIcon>
			<img
				alt="Muse's logo, a donut-like circle with shades of blue."
				src={imageUrl.href}
				height={24}
				width={24}
			/>
		</AppIcon>

		<AppNamePlusFolder />

		<Buttons />
	</TopWrapper>
);

export const DecorationsDown = () => (
	<DownWrapper>
		<LeftSlot>
			<MediasInfo />
		</LeftSlot>

		<RightSlot></RightSlot>
	</DownWrapper>
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
