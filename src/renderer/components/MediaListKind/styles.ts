import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Img = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;

	min-width: 45px;
	height: 45px;

	border-radius: 13px;
	margin: 0 10px;
	border: none;

	box-shadow: ${theme.boxShadows.small};

	img {
		object-fit: cover;
		height: 45px;
		width: 45px;

		border-radius: 13px;
		border: none;
	}

	img:before {
		display: none;
	}
`;

export const Info = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;

	height: calc(100% - 5px);
	width: calc(100% - 5px);

	overflow: hidden;
`;

export const Title = styled.p`
	font-family: ${fonts.primary};
	color: ${theme.colors.text};
	letter-spacing: 0.03em;
	font-weight: 500;
	font-size: 1rem;

	word-wrap: normal;
	overflow: hidden;
	/* white-space: nowrap; // make it one-line. */

	/* animation: 6s linear 0s infinite move;

	@keyframes move {
		from {
			transform: translateX(0%);
			left: 0%;
		}
		to {
			transform: translateX(-110%);
			left: 110%;
		}
	} */
`;

export const SubTitle = styled.p`
	font-family: ${fonts.primary};
	color: ${theme.colors.grayText};
	letter-spacing: 0.03em;
	font-size: 0.8em;
	font-weight: 500;
`;

export const Options = styled.button`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	background: transparent;
	border-radius: 7px;
	margin: 5px;

	width: 25px;
	height: 80%;

	cursor: pointer;
	border: none;

	&:hover {
		box-shadow: ${theme.boxShadows.medium};
		transition: box-shadow 0.3s ease-in-out 17ms;
	}
`;

export const ListWrapper = styled.div`
	box-shadow: ${theme.boxShadows.medium};
	box-sizing: border-box;
	border-radius: 7px;
	max-width: 600px;
	margin: 2em 5%;
	height: 65vh;
	z-index: 1;

	@media (max-width: 500px) {
		margin: 0.5em 5%;
	}

	.list {
		overflow-x: hidden !important;

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
	}
`;

export const RowWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;

	width: 98% !important;

	border-radius: 7px;
	margin: 7px;

	&:hover {
		box-shadow: ${theme.boxShadows.medium};
		transition: box-shadow 0.2s ease-in-out 17ms;
	}

	.active {
		box-shadow: ${theme.boxShadows.medium};

		background: white;

		outline: 3px solid ${theme.colors.bgCentral};
		outline-offset: -3px;
	}
`;

export const PlayButton = styled.div`
	display: flex;
	position: relative;
	flex-direction: row;
	justify-content: center;
	align-items: center;

	width: 90%;
	height: 100%;

	cursor: pointer;
`;

export const InputWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 50px;
	width: 320px;

	box-shadow: ${theme.boxShadows.medium};
	background: #d3d3d5;
	border-radius: 7px;
	padding: 0.5rem;

	input {
		font-family: ${fonts.primary};
		font-weight: 500;
		letter-spacing: 0.03em;
		box-sizing: border-box;
		font-size: 1.05rem;
		color: #00525e;

		height: 26px;
		width: 100%;

		border: none;

		background: transparent;
		padding-left: 10px;

		::-webkit-input-placeholder {
			display: flex;
			justify-content: flex-start;
			align-items: center;

			color: rgba(0, 0, 0, 0.5);
			font-style: italic;
		}
	}
`;
