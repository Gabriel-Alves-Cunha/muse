import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	position: absolute;

	// center itself:
	left: 50%;
	transform: translate(-50%);

	bottom: 25px; // <-- This is being needed to push it up a little :( something with the absolute positioning...
	height: 11vh;
	width: 95vw;
	z-index: 30;

	border-top-right-radius: 40px;
	border-top-left-radius: 40px;
	background-color: #e0e0e095;
	border: none;
	padding: 0.8rem;

	box-shadow: ${theme.boxShadows.medium};
	backdrop-filter: blur(5px);
`;

export const Img = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;

	height: 70px;
	min-width: 70px;

	margin-left: 1%;

	border: none;
	border-radius: 17px;

	box-shadow: 7px 7px 14px #b1b1b1, -7px -7px 14px #ffffff;

	img {
		object-fit: cover;
		width: 70px;
		height: 70px;

		border: none;
		border-radius: 17px;
	}
`;

export const Info = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: 100%;
	margin-left: 3%;

	.title {
		font-size: 1.1rem;
		font-family: ${fonts.primary};
		font-weight: 500;
		letter-spacing: 0.03em;
		color: ${theme.colors.text};
		overflow-y: hidden;

		max-height: 70px;
	}

	.subtitle {
		font-size: 0.9rem;
		font-family: ${fonts.primary};
		font-weight: 400;
		letter-spacing: 0.03em;
		color: ${theme.colors.grayText};
		overflow-y: hidden;
	}
`;

export const Controls = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin-left: 10%;
	gap: 10px;

	span {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.previous-or-next {
		border-radius: 50%;
		cursor: pointer;
		height: 30px;
		width: 30px;

		&:hover {
			box-shadow: ${theme.boxShadows.small};
			transition: opacity 0.1s ease-in-out 17ms;
		}
	}

	.play-pause {
		border-radius: 50%;
		cursor: pointer;
		height: 40px;
		width: 40px;
		color: #27283899;

		&:hover {
			box-shadow: 7px 7px 14px #b1b1b1, -7px -7px 14px #ffffff;
			transition: opacity 0.1s ease-in-out 17ms;
		}
	}
`;

export const SeekerContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 1rem;
	width: 275px;

	span {
		font-family: ${fonts.primary};
		color: ${theme.colors.grayText};
		background-color: transparent;
		letter-spacing: 0.03em;
		text-align: center;
		font-size: 1rem;
		border: none;
	}
`;

export const ProgressWrapper = styled.div`
	display: block;
	width: 200px;
	height: 3px;

	background-color: rgba(125, 125, 125, 0.6);
	cursor: pointer;
	margin: 0 7px;
`;
