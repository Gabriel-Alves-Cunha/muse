import type { ReactNode, ComponentProps } from "react";

import { styled } from "@styles/global";
import { theme } from "@styles/theme";

type Props = ComponentProps<typeof ButtonStyled> & {
	children?: ReactNode;
};

export function Button({ children, ...rest }: Props) {
	return <ButtonStyled {...rest}>{children}</ButtonStyled>;
}

const ButtonStyled = styled("button", {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	size: 22,

	border: `1px solid ${theme.colors.buttonBorder}`,
	backgroundColor: "transparent",
	borderRadius: 10,
	padding: 2,

	"&:hover": {
		backgroundColor: theme.colors.buttonHovered,
	},
});

// 10px 20px 30px 40px / 15px 30px 45px 60px;
