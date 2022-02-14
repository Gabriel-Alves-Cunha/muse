import styled from "@emotion/styled";

import { fonts, theme } from "../../styles/theme";

export const Wrapper = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;

	div {
		display: flex;
		justify-content: center;
		align-items: center;

		width: 200px;
		height: 30px;
		margin-top: 2rem;
		padding: 1rem;

		${fonts.all};
		font-weight: 500;
		font-size: 1.1rem;

		border: 1px solid ${theme.colors.navButtonHoveredColor};

		&:hover {
			transition: background-color 0.15s ease-in-out;
			background-color: ${theme.colors.navButtonHoveredColor};
			cursor: pointer;
			color: white;
		}
	}

	input {
		display: none;
	}
`;
