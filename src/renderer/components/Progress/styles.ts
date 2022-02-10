import styled from "@emotion/styled";

import { Status } from "./index";
import { theme } from "@styles/theme";

export const Bar = styled.div<{ percentage: number }>`
	width: ${({ percentage }) => percentage}%;
	height: 100%;

	background-color: ${theme.colors.accent};
	transition: width 0.3s linear;

	.${Status.ACTIVE} {
		position: absolute;
		height: 100%;

		animation: progress-active 2s cubic-bezier(0.23, 1, 0.32, 1) infinite;
		background-color: white;

		@keyframes progress-active {
			0% {
				opacity: 0.3;
				width: 0;
			}

			40% {
				opacity: 0.7;
				width: 0;
			}

			80% {
				opacity: 0.3;
			}

			100% {
				opacity: 0;
				width: ${({ percentage }) => percentage}%;
			}
		}
	}
`;

export const ProgressBarWrapper = styled.div`
	position: relative;
	height: 3px;
	width: 90%;

	background-color: ${theme.colors.bgNav};
`;

export const Component = styled.div`
	display: flex;
	height: 15px;
	width: 100%;

	align-items: center;

	svg {
		margin: auto;
	}
`;
