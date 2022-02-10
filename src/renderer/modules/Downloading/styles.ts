import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Circle = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;

	bottom: 20vh;
	left: 10px;
	z-index: 50;
	cursor: pointer;

	border-radius: 20px;
	height: 40px;
	width: 40px;

	background-color: ${theme.colors.bgNav};
	box-shadow: var(--box-shadow-small);

	&:hover {
		box-shadow: var(--inset-box-shadow-small);
	}
`;

export const Popup = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;
	height: 100px;
	width: 250px;
	bottom: 20vh;
	left: 10px;
	gap: 1rem;

	border-radius: 20px;
	overflow-x: hidden;
	overflow-y: auto;
	padding: 1rem;
	z-index: 500;

	background-color: ${theme.colors.bgCentral};
	box-shadow: var(--box-shadow-small);

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
		font-size: 0.8rem;
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
