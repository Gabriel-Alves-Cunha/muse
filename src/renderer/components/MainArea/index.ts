import styled from "@emotion/styled";

export const MainArea = styled.div`
	flex-direction: column;
	position: relative;
	display: flex;

	height: 100%;
	width: 100%;

	@media (max-width: 500px) {
		header {
			justify-content: center;
			margin-left: 0;
		}
	}
`;
