import { VariantProps, CSS } from "@stitches/react/types";
import { styled } from "@styles/global";

export const TooltipButton = ({
	"tooltip-side": tooltipSide,
	className = "",
	css = {},
	children,
	tooltip,
	...props
}: Props) => (
	<TooltipButton_
		tooltip-side={tooltipSide}
		data-tooltip={tooltip}
		className={className}
		css={css}
		{...props}
	>
		{children}
	</TooltipButton_>
);

export const TooltipButton_ = styled("button", {
	position: "relative",

	background: "none",
	cursor: "pointer",
	border: "none",

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
		zIndex: 100,

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

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	"tooltip-side"?: VariantProps<typeof TooltipButton_>["tooltip-side"];
	children: React.ReactNode;
	className?: string;
	tooltip: string;
	css?: CSS;
};
