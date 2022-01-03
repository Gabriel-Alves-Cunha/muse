import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
	VscChromeMaximize as Maximize,
	VscChromeMinimize as Minimize,
	VscClose as Close,
} from "react-icons/vsc";

import { capitalizedAppName } from "@utils/app";
import { capitalize } from "@utils/utils";
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
				<img src={imageUrl.href} width="24px" height="24px" />
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
			<WindowButton onClick={closeWindow} isToClose={true}>
				<Close size="16px" />
			</WindowButton>

			<WindowButton onClick={toggleMaximize}>
				<Maximize size="16px" />
			</WindowButton>

			<WindowButton onClick={minimizeWindow}>
				<Minimize size="16px" />
			</WindowButton>
		</WindowButtons>
	);
}

function AppName_Folder() {
	const { pathname } = useLocation();

	const page = capitalize(pathname.replace("/", ""));

	return (
		<AppName_Folder_Wrapper>
			{page ? page + " - " + capitalizedAppName : capitalizedAppName}
		</AppName_Folder_Wrapper>
	);
}
