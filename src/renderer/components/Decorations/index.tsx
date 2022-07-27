import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { NumberOfMediasSelected } from "./NumberOfMediasSelected";
import { capitalizedAppName } from "@common/utils";
import { NumberOfMedias } from "./NumberOfMedias";
import { MediasInfo } from "@components/Decorations/MediasInfo";
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
	RightSlot,
	LeftSlot,
	AppIcon,
} from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

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

/////////////////////////////////////////////

export const DecorationsDown = () => (
	<DownWrapper>
		<LeftSlot>
			<NumberOfMedias />

			<MediasInfo />
		</LeftSlot>

		<RightSlot>
			<NumberOfMediasSelected />
		</RightSlot>
	</DownWrapper>
);

/////////////////////////////////////////////

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

/////////////////////////////////////////////

function AppNamePlusFolder() {
	const { page } = usePage();

	return (
		<AppName_Folder_Wrapper>
			{capitalizedAppName} • {page}
		</AppName_Folder_Wrapper>
	);
}
