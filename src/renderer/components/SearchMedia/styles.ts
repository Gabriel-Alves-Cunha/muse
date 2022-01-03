import styled from "@emotion/styled";

import { fonts, theme } from "@styles/theme";

export const Wrapper = styled.header`
	display: flex;
	flex-direction: row;
	justify-content: space-between !important;
	align-items: center;

	padding: 0 5%;

	max-width: 500px;
	height: 60px;
	width: 90%;
`;

export const SearchWrapper = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
`;

export const Search = styled.div`
	position: relative;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;

	max-width: 500px;
	min-width: 100%;
	height: 30px;

	background: transparent;
	border-radius: 15px;
	border: none;
	cursor: text;
	color: #ccc;

	box-shadow: var(--box-shadow-small);

	svg {
		margin-left: 10px;
	}

	&:hover {
		box-shadow: var(--inset-box-shadow-small);

		svg {
			color: rgba(0, 0, 0, 0.5);
		}
	}

	input {
		font-family: ${fonts.primary};
		letter-spacing: 0.03em;
		box-sizing: border-box;
		font-size: 0.9rem;

		height: 100%;
		width: 100%;

		background: transparent;
		border-radius: 15px;
		border: none;

		color: rgba(0, 0, 0, 0.5);
		padding-right: 10px;
		padding-left: 10px;

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

export const ReloadContainer = styled.button<{ isSearching: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;

	background-color: transparent;
	margin-left: 1rem;
	cursor: pointer;
	border: none;

	&:hover {
		will-change: transform;
		animation: ${({ isSearching }) => (isSearching ? "" : "spin 0.5s linear")};

		@keyframes spin {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}
	}
`;

export const Button = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;

	background-color: transparent;
	/* margin-left: 1rem; */
	cursor: pointer;
	border: none;
`;

export const SearchResultsWrapper = styled.section`
	position: absolute;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 40vh;
	width: 100%;

	border-radius: 7px;
	margin-top: 30px;
	z-index: 10;

	background-color: ${theme.colors.secondary};
	box-shadow: var(--box-shadow-medium);

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

export const Result = styled.button`
	cursor: pointer;
	border: none;

	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;

	width: 95% !important;

	background-color: ${theme.colors.secondary};
	margin: 10px !important;
	border-radius: 7px;

	will-change: box-shadow;
	transition: box-shadow 0.2s ease;

	&:hover {
		z-index: 20;
		box-shadow: var(--box-shadow-medium);
	}
`;
