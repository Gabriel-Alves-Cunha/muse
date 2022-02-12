import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Wrapper = styled.section`
	display: flex;
	position: relative;
	flex-direction: column;
	justify-content: flex-start;

	width: 100%;
	height: calc(100vh - 20vh);

	overflow-y: hidden;

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

export const SearchWrapper = styled.div`
	display: flex;
	position: relative;
	flex-direction: row;
	align-items: center;
	justify-content: center;

	height: 60px;
	padding: 0 5%;

	p {
		position: absolute;
		margin-top: 4rem;
		font-size: 0.8rem;
		letter-spacing: 0.02rem;
		font-family: ${fonts.primary};
		color: red;
	}
`;

export const Searcher = styled.button`
	position: relative;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;

	height: 30px;
	background: transparent;
	color: #ccc;
	width: 80%;

	border: none;
	border-radius: 15px;
	cursor: text;

	box-shadow: ${theme.boxShadows.small};

	svg {
		margin-left: 10px;
	}

	&::after {
		box-shadow: ${theme.boxShadows.inset_small};
		opacity: 0;
		transition: opacity 0s ease-in-out 17ms;
	}

	&:hover::after {
		opacity: 1;
	}

	&:hover svg {
		color: rgba(0, 0, 0, 0.5);
	}

	input {
		box-sizing: border-box;
		font-size: 0.9rem;
		font-family: ${fonts.primary};
		letter-spacing: 0.03em;

		height: 100%;
		width: 100%;

		border: none;
		border-radius: 15px;
		background: transparent;

		padding-left: 10px;
		padding-right: 10px;
		color: rgba(0, 0, 0, 0.5);

		::placeholder {
			color: #ccc;
		}

		&:hover {
			::placeholder {
				color: rgba(0, 0, 0, 0.5);
			}
		}
	}
`;

export const ResultContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin-bottom: 1.3rem;

	img {
		object-fit: cover;
		display: flex;

		width: 90%;
		height: 90%;

		max-width: 250px;
		max-height: 250px;

		-webkit-box-reflect: below 0px -webkit-gradient(linear, right top, right
					bottom, from(transparent), color-stop(40%, transparent), to(rgba(255, 255, 255, 0.1)));

		box-shadow: 0px 50px 70px rgba(0, 0, 0, 0.3),
			0px 10px 10px rgba(0, 0, 0, 0.1);

		will-change: transform;
		transition: transform 0.2s ease-in-out 17ms;

		&:hover {
			transform: scale(1.04);
		}
	}

	p {
		text-align: center;
		margin: 2rem 1rem;
		font-size: 1.1rem;
		font-family: ${fonts.primary};

		color: black;
		word-wrap: normal;
	}

	span {
		text-align: center;
		margin: 1rem auto;
		font-size: 1rem;
		font-family: ${fonts.primary};

		color: black;
		word-wrap: normal;
	}
`;

export const Button = styled.button`
	display: flex; // row
	justify-content: center;
	align-items: center;
	width: 160px;
	height: 42px;

	background-color: transparent;
	font-size: 1rem;
	font-family: ${fonts.primary};
	text-align: center;
	padding: 10px;
	cursor: pointer;

	background-color: ${theme.colors.bgNav};
	color: black;

	border: none;
	border-radius: 5px;

	box-shadow: ${theme.boxShadows.small};

	&:hover {
		box-shadow: ${theme.boxShadows.inset_small};
		transition: opacity 0.3s ease-in-out 17ms;
	}
`;
