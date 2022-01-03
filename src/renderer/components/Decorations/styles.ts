import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const HEADER_HEIGHT = "27px" as const;

export const Wrapper = styled.header`
	height: ${HEADER_HEIGHT};
	position: relative;
	display: flex;

	background-color: ${theme.colors.secondary};

	-webkit-user-select: none;
	-webkit-app-region: drag;
	// ^ window-draggable-region
	user-select: none;
`;

export const WindowButton = styled.button<{ isToClose?: boolean }>`
	justify-content: center;
	align-content: center;
	align-items: center;
	display: flex;

	border: none;
	color: black;

	height: ${HEADER_HEIGHT};
	width: 48px;

	background-color: ${theme.colors.secondary};

	&:hover {
		background-color: ${({ isToClose }) => (isToClose ? "#e70000" : "#dbdadc")};
		${({ isToClose }) => (isToClose ? "color: white;" : "")};
	}
`;

export const WindowButtons = styled.div`
	display: flex;
	flex-direction: row-reverse;
	margin-left: auto;
	height: 100%;

	background-color: ${theme.colors.secondary};
`;

export const AppName_Folder_Wrapper = styled.button`
	background-color: ${theme.colors.secondary};
	border: none;

	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	height: 100%;
	left: 50%;

	transform: translate(-50%);

	font-family: ${fonts.primary};
	color: ${theme.colors.text};
	letter-spacing: 0.03em;
	font-weight: 300;
	font-size: 0.9em;

	@media (max-width: 500px) {
		display: none;
	}
`;

export const AppIcon = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;

	margin-left: 7px;
`;
