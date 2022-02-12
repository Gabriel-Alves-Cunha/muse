import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Circle = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;

	bottom: 27vh;
	left: 10px;
	z-index: 50;
	cursor: pointer;

	border-radius: 20px;
	height: 40px;
	width: 40px;

	background-color: ${theme.colors.bgNav};
	box-shadow: ${theme.boxShadows.small};

	&:hover {
		box-shadow: ${theme.boxShadows.inset_small};
		transition: opacity 0s ease-in-out 17ms;
	}
`;

export const Popup = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;
	height: 100px;
	width: 250px;
	bottom: 27vh;
	left: 10px;
	gap: 1rem;

	border-radius: 20px;
	overflow-x: hidden;
	overflow-y: auto;
	padding: 1rem;
	z-index: 500;

	background-color: ${theme.colors.bgCentral};
	box-shadow: ${theme.boxShadows.small};

	/* width */
	::-webkit-scrollbar {
		width: 5px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
`;

export const Progress = styled.div`
	font-family: ${fonts.primary};
	color: ${theme.colors.text};
	white-space: nowrap;
	overflow: hidden;
	text-align: left;
	font-size: 0.9rem;
	gap: 0.5rem;

	table {
		display: flex;
		justify-content: 1fr;
		width: 100%;
	}

	td:nth-of-type(2) {
		border-right: 1px solid ${theme.colors.text};
		padding-right: 5px;
		width: 100%;
	}
`;

export const Title = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 1rem;
	margin-bottom: 10px;

	p {
		font-family: ${fonts.primary};
		white-space: nowrap;
		overflow: hidden;
		font-size: 0.9rem;
		text-align: left;
		color: #777;

		width: 90%;
	}

	span {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 20px;
		width: 20px;

		border-radius: 50%;
		margin-left: 10px;

		background-color: transparent;

		&:hover {
			background-color: rgba(125, 125, 125, 0.3);
			color: red;

			svg {
				fill: red;
			}
		}
	}
`;
