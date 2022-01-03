import styled from "@emotion/styled";

export const Dots = styled.div`
	position: relative;
	background: gray;
	height: 3px;
	width: 3px;

	&::before {
		content: "";
		position: absolute;
		height: 3px;
		width: 3px;
		top: -6px;
		left: 0px;

		background: gray;
	}

	&::after {
		content: "";
		position: absolute;
		height: 3px;
		width: 3px;
		left: 0px;
		top: 6px;

		background: gray;
	}
`;
