import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Nav = styled.nav`
	display: flex;
	flex-direction: column;
	align-content: center;

	height: 100vh;
	width: 170px;

	background-color: ${theme.colors.bgNav};

	.active {
		outline: 3px solid ${theme.colors.bgCentral};
		outline-offset: -3px;

		background: white;

		box-shadow: var(--box-shadow-small);
	}

	@media (max-width: 500px) {
		width: 30px;

		.active {
			box-shadow: none;
			outline: none;

			background-color: ${theme.colors.accentAlpha};
		}

		button {
			justify-content: center;

			height: 42px;
			width: 30px;

			padding: 0;
			margin: 0;

			box-shadow: none;
			border-radius: 0;

			&:hover {
				box-shadow: none;
			}

			div {
				// Text
				display: none;
			}

			span {
				// svg
				color: black;
				margin: 0;
			}
		}
	}
`;

export const FolderButton = styled.button`
	display: flex; // row
	align-items: center;
	width: 160px;
	height: 42px;

	background-color: transparent;
	font-size: 1rem;
	cursor: pointer;
	padding: 10px;
	margin: 5px;

	border-radius: 5px;
	border: none;

	will-change: box-shadow;
	transition: box-shadow 0.2s ease;

	span {
		display: flex;
		align-items: center;

		margin-right: 10px;
	}

	&:hover {
		&:not(.active) {
			box-shadow: var(--inset-box-shadow-small);
		}
	}
`;

export const Text = styled.div`
	font-family: ${fonts.primary};
	color: ${theme.colors.text};
	letter-spacing: 0.03em;
	font-size: 1.05rem;
	font-weight: 500;
	text-align: left;
`;
