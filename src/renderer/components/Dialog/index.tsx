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

	color: "$deactivated-icon",
	background: "transparent",
	borderRadius: "50%",
	cursor: "pointer",
	border: "none",
	margin: 5,

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		background: "$icon-button-hovered",
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
		background: "#181818",
		padding: "3px 8px",

		whiteSpace: "nowrap",
		lineHeight: "normal",
		ff: "$primary",
		color: "#fff",
		ta: "center",
		fs: "1rem",
		fw: 500,

		pointerEvents: "none",
	},

	variants: {
		"tooltip-side": {
			"left-bottom": {
				"&::before, ::after": {
					right: "50%",
					top: "110%",
				},
			},
			bottom: {
				"&::before, ::after": {
					top: "110%",
				},
			},
			right: {
				"&::before, ::after": {
					left: "110%",
				},
			},
			left: {
				"&::before, ::after": {
					right: "110%",
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
