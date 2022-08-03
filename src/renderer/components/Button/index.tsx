import type { ComponentProps } from "@stitches/react";

import { forwardRef, type Ref } from "react";

import { styled } from "@styles/global";

export const Button = forwardRef((
	{ className, children, variant, ...props }: Props,
	forwardedRef: Ref<HTMLButtonElement>,
) => (
	<GenericBorderedButton
		className={className + " " + variant}
		{...props}
		ref={forwardedRef}
	>
		{children}
	</GenericBorderedButton>
));
Button.displayName = "Button";

const GenericBorderedButton = styled("button", {
	dflex: "center",
	gap: 16,

	// Variants:
	"&.large": { w: 300, h: 50, m: "40 auto 0", p: 16, br: 7 },

	"&.medium": { w: "100%", h: 50, m: "20 auto 0", p: 10, br: 5 },

	"&.input": {
		w: "calc(100% - 115px)", // magic number that I found to work to keep it's size equal to the other inputs...
		h: 35,

		b: "2px solid $input-border",
		br: 12,

		transitionProperty: "border-color, background",
		transition: "250ms ease",

		"&:hover, &:focus": {
			borderColor: "$input-border-active",
			bg: "$input-border-active",
			c: "white",
		},
	},
	//

	whiteSpace: "nowrap", // keep it one line!
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	c: "$text",
	fw: 500,

	b: "2px solid $accent",
	cursor: "pointer",
	bg: "none",
	br: 7,

	transition: "$bgc",

	"&:hover, &:focus": { bg: "$accent", c: "white" },

	input: { d: "none" },

	/////////////////////////////////////////////
	// Additional classes

	"&.file-present": {
		bg: "rgb(0, 255, 89)",
		c: "black",

		transition: "border-color 250ms ease",

		"&:hover, &:focus": { bg: "$input-border-active", c: "white" },
	},
});

/////////////////////////////////////////////
// Types:

type Props =
	& ComponentProps<typeof GenericBorderedButton>
	& Readonly<
		{
			variant: "large" | "medium" | "input";
			children: React.ReactNode;
			className?: string;
		}
	>;
