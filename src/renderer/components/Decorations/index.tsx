import { useEffect, useState } from "react";
import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@common/utils";
import { usePage } from "@contexts/page";
import {
	handleMaximizeOnDoubleClick,
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

export function Decorations() {
	const [showDecorations, setShowDecorations] = useState(true);

	useEffect(() => {
		function handlelistenToResizeEvent() {
			setTimeout(() => {
				window.innerWidth / window.screen.width >= 0.97 &&
				window.innerHeight / window.screen.height >= 0.97
					? setShowDecorations(false)
					: setShowDecorations(true);
			}, 500);
		}

		window.addEventListener("resize", handlelistenToResizeEvent);

		return () =>
			window.removeEventListener("resize", handlelistenToResizeEvent);
	}, []);

	return showDecorations ? (
		<Wrapper onClick={handleMaximizeOnDoubleClick}>
			{/* ^ window-draggable-region */}
			<AppIcon>
				<img src={imageUrl.href} width="24px" height="24px" alt="Muse's logo" />
			</AppIcon>

			<AppName_Folder />

			<Buttons />
		</Wrapper>
	) : null;
}

Decorations.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "Decorations",
};

function Buttons() {
	return (
		<WindowButtons>
			<WindowButton
				aria-label="Close window"
				onClick={closeWindow}
				isToClose={true}
			>
				<Close size="16px" />
			</WindowButton>

			<WindowButton
				onClick={toggleMaximize}
				aria-label="Toggle maximize window"
			>
				<Maximize size="16px" />
			</WindowButton>

			<WindowButton onClick={minimizeWindow} aria-label="Minize window">
				<Minimize size="16px" />
			</WindowButton>
		</WindowButtons>
	);
}

const AppName_Folder = () => {
	const page = usePage().page;

	return (
		<AppName_Folder_Wrapper>
			{page + " - " + capitalizedAppName}
		</AppName_Folder_Wrapper>
	);
};
