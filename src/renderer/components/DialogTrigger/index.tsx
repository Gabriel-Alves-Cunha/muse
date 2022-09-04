import type { ComponentProps } from "@stitches/react";

import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const DialogTrigger = ({ children, className, tooltip }: Props) => (
	<StyledDialogTrigger
		className={"notransition " + (className ?? "")}
		aria-label={tooltip}
		title={tooltip}
	>
		{children}
	</StyledDialogTrigger>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Styles:

const StyledDialogTrigger = styled(Trigger, {
	m: "unset",

	pos: "relative",
	dflex: "center",
	size: 29,

	c: "$deactivated-icon",
	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",

	"&:hover, &:focus": { bg: "$icon-button-hovered", "& svg": { c: "$text" } },

	"&.on-search-media": {
		pos: "absolute",
		t: "25%",
		r: 10,

		"&:hover, &:focus": {
			bg: "$media-player-icon-button-hovered",

			"& svg": { c: "inherit" }, // keep same color
		},
	},
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface Props extends ComponentProps<typeof StyledDialogTrigger> {
	readonly children: React.ReactNode;
	readonly className?: string;
	readonly tooltip: string;
}
