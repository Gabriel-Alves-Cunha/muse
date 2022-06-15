import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

export const DialogTrigger = ({ children }: Props) => (
	<StyledTrigger>{children}</StyledTrigger>
);

const StyledTrigger = styled(Trigger, {
	m: "unset",

	position: "relative",
	dflex: "center",
	size: 29,

	c: "$deactivated-icon",
	bg: "transparent",
	br: "50%",
	cursor: "pointer",
	border: "none",
	// margin: 5,

	transition: "$bgc",

	"&:hover": { transition: "$bgc", bg: "$icon-button-hovered" },

	"&.unset-margin": { m: "unset" },
});

type Props = { children: React.ReactNode; };
