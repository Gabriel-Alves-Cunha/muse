import type { VariantProps } from "@stitches/react";

import { Trigger, type DialogTriggerProps } from "@radix-ui/react-dialog";

import { TooltipButton_ } from "@components/TooltipButton";
import { styled } from "@styles/global";

export function DialogTrigger({
	"data-tooltip": dataTooltip,
	children,
	"tooltip-side": tooltipSide,
}: Props) {
	return (
		<StyledTrigger tooltip-side={tooltipSide} data-tooltip={dataTooltip}>
			{children}
		</StyledTrigger>
	);
}

const StyledTrigger = styled(Trigger, {
	position: "relative",
	dflex: "center",
	size: 29,

	c: "$deactivated-icon",
	bg: "transparent",
	br: "50%",
	cursor: "pointer",
	border: "none",
	margin: 5,

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		bg: "$icon-button-hovered",
	},

	// For tooltip, cause I could not make it work
	// with the TooltipButton_ component:
	"&:active": {
		"&::before, ::after": {
			visibility: "hidden",
		},
	},

	"&:hover::before": {
		visibility: "visible",

		transition: "all 0.4s 1s ease ",
	},

	"&::before, ::after": {
		visibility: "hidden",

		content: "attr(data-tooltip)",
		position: "absolute",
		height: "auto",
		width: "auto",

		border: "1px solid white",
		bg: "#181818",
		p: "3px 8px",

		whiteSpace: "nowrap",
		lh: "normal",
		ff: "$primary",
		c: "#fff",
		ta: "center",
		fs: "1rem",
		fw: 500,

		pointerEvents: "none",
	},

	variants: {
		"tooltip-side": {
			"left-bottom": {
				"&::before, ::after": {
					r: "50%",
					t: "110%",
				},
			},
			bottom: {
				"&::before, ::after": {
					t: "110%",
				},
			},
			right: {
				"&::before, ::after": {
					left: "110%",
				},
			},
			left: {
				"&::before, ::after": {
					r: "110%",
				},
			},
			top: {
				"&::before, ::after": {
					bottom: "110%",
				},
			},
		},
	},

	defaultVariants: {
		"tooltip-side": "bottom",
	},
});

type Props = DialogTriggerProps & {
	"tooltip-side"?: VariantProps<typeof TooltipButton_>["tooltip-side"];
	"data-tooltip": string;
};
