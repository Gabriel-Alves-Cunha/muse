import type { ComponentProps } from "@stitches/react";

import { styled } from "@styles/global";

export const Button = ({ className, children, variant, ...props }: Props) => (
	<GenericBorderedButton className={className + " " + variant} {...props}>
		{children}
	</GenericBorderedButton>
);

const GenericBorderedButton = styled("button", {
	dflex: "center",
	gap: 16,

	"&.large": { w: 300, h: 50, m: "40 auto 0", p: 16, fs: "1.1rem", br: 7 },

	"&.medium": { w: "100%", h: 50, m: "20 auto 0", p: 10, fs: "1rem", br: 5 },

	whiteSpace: "nowrap", // keep it one line
	ff: "$secondary",
	ls: "0.035rem",
	c: "$text",
	fw: 500,

	b: "2px solid $accent",
	cursor: "pointer",
	bg: "none",
	br: 7,

	transition: "$bgc",

	"&:hover, &:focus": { bg: "$accent", c: "white" },

	input: { d: "none" },
});

/////////////////////////////////////////////
// Types:

type Props =
	& ComponentProps<typeof GenericBorderedButton>
	& Readonly<
		{
			variant: "large" | "medium";
			children: React.ReactNode;
			className?: string;
		}
	>;
