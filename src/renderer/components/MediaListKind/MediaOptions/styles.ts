import styled from "@emotion/styled";

import { theme, fonts } from "@styles/theme";

export const OptionsModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	max-height: 400px;
	max-width: 320px;

	background-color: ${theme.colors.bgNav};
	border-radius: 10px;

	overflow-x: hidden;
	overflow-y: auto;

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

export const Option = styled.button`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;

	font-family: ${fonts.primary};
	letter-spacing: 0.03em;
	font-size: 1rem;

	background: #edecf8;
	color: #00525e;
	height: 50px;
	width: 100%;

	border: none;
	border-bottom: 1px solid #ccc;
	overflow-y: visible;
	padding: 0.7rem;

	user-select: text;
	cursor: text;

	::selection {
		background: #aa00ff; // theme.colors.accent
		color: #fff;
	}

	&.hoverable {
		cursor: pointer;

		&:hover {
			transition: background-color 0.1s ease-in-out;
			background-color: #d3d3d5;
		}
	}

	span {
		font-family: ${fonts.primary};
		letter-spacing: 0.03em;
		text-align: left;
		font-size: 1rem;
		color: #8e8e8e;

		::selection {
			background: #aa00ff; // theme.colors.accent
			color: #fff;
		}
	}

	&.rm {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		color: white;

		background: #bb2b2e;

		&:hover {
			transition: background-color 0.1s ease-in-out;
			background-color: #821e20;
			cursor: pointer;
		}
	}
`;

export const Confirm = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	max-height: 350px;
	width: 320px;

	font-family: ${fonts.primary};
	letter-spacing: 0.03em;
	border-radius: 10px;
	background: #edecf8;
	text-align: center;
	font-size: 1.05rem;
	flex-wrap: wrap;
	color: #00525e;

	p {
		padding: 0.8rem;
	}

	span {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		width: 100%;

		font-family: ${fonts.primary};
		letter-spacing: 0.03em;
		font-size: 1.05rem;
		font-weight: 500;
		color: white;

		&.yes {
			margin-top: 0.8rem;
			background: #bb2b2e;
		}
		&.no {
			border-bottom-right-radius: 10px;
			border-bottom-left-radius: 10px;
			background: #219a00;
		}

		&:hover {
			transition: background-color 0.1s ease;
			filter: brightness(1.1);
			cursor: pointer;
			color: black;
		}
	}
`;
