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
import { t } from "@components/I18n";
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
				alt={t("alts.museLogo")}
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
			aria-label={t("tooltips.closeWindow")}
			title={t("tooltips.closeWindow")}
			onPointerUp={closeWindow}
			id="close"
		>
			<Close size={16} />
		</WindowButton>

		<WindowButton
			aria-label={t("tooltips.toggleMaximizeWindow")}
			title={t("tooltips.toggleMaximizeWindow")}
			onPointerUp={toggleMaximize}
		>
			<Maximize size={16} />
		</WindowButton>

		<WindowButton
			aria-label={t("tooltips.toggleMinimizeWindow")}
			title={t("tooltips.toggleMinimizeWindow")}
			onPointerUp={minimizeWindow}
		>
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
