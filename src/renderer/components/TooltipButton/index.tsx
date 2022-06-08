import type { VariantProps, CSS } from "@stitches/react/types";

import { type ComponentPropsWithRef, type Ref, forwardRef } from "react";

import { styled } from "@styles/global";

export const TooltipButton = forwardRef(
	(
		{
			"tooltip-side": tooltipSide,
			className = "",
			css = {},
			children,
			tooltip,
			...props
		}: Props,
		forwardedRef: Ref<HTMLButtonElement>,
	) => (
		<TooltipButton_
			tooltip-side={tooltipSide}
			data-tooltip={tooltip}
			className={className}
			ref={forwardedRef}
			css={css}
			{...props}
		>
			{children}
		</TooltipButton_>
	),
);
TooltipButton.displayName = "TooltipButton";

export const TooltipButton_ = styled("button", {
	pos: "relative",
	dflex: "center",

	cursor: "pointer",
	bg: "none",
	b: "none",

	transition: "none !important",

	"&:active": {
		"&::before, &::after": {
			visibility: "hidden",
		},
	},

	"&:hover::before": {
		visibility: "visible",

		transition: "all 0.4s 1s ease ",
	},

	"&::before, &::after": {
		visibility: "hidden",

		content: "attr(data-tooltip)",
		pos: "absolute",
		size: "auto",

		b: "1px solid white",
		bg: "#181818",
		p: "3px 8px",
		zIndex: 100,

		whiteSpace: "nowrap",
		ff: "$primary",
		lh: "normal",
		ta: "center",
		fs: "1rem",
		c: "#fff",
		fw: 500,

		pointerEvents: "none",
	},

	variants: {
		"tooltip-side": {
			"left-bottom": {
				"&::before, &::after": {
					t: "110%",
					r: "50%",
				},
			},
			bottom: {
				"&::before, &::after": {
					t: "110%",
				},
			},
			right: {
				"&::before, &::after": {
					l: "110%",
				},
			},
			left: {
				"&::before, &::after": {
					r: "110%",
				},
			},
			top: {
				"&::before, &::after": {
					bottom: "110%",
				},
			},
		},
	},

	defaultVariants: {
		"tooltip-side": "bottom",
	},
});

type Props = ComponentPropsWithRef<"button"> & {
	"tooltip-side"?: VariantProps<typeof TooltipButton_>["tooltip-side"];
	children: React.ReactNode;
	className?: string;
	tooltip: string;
	css?: CSS;
};
