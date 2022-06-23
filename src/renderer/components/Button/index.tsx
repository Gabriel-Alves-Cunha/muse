import { ComponentProps } from "@stitches/react";
import { styled } from "@styles/global";

export const Button = ({ className, children, variant, ...props }: Props) => (
	<Button_ className={className + " " + variant} {...props}>
		{children}
	</Button_>
);

const Button_ = styled("button", {
	dflex: "center",

	"&.large": {
		w: 300,
		h: 50,

		m: "40 auto 0",
		p: 16,

		fs: "1.1rem",
	},

	"&.medium": {
		w: 200,
		h: 40,

		m: "20 auto 0",
		p: 8,

		fs: "1rem",
	},

	gap: 16,

	ff: "$secondary",
	ls: "0.03rem",
	c: "$text",
	fw: 500,

	b: "2px solid $accent",
	cursor: "pointer",
	bg: "none",
	br: 7,

	transition: "$bgc",

	"&:hover": { bg: "$accent", c: "white" },

	input: { d: "none" },
});

type Props = ComponentProps<typeof Button_> &
	Readonly<{
		variant: "large" | "medium";
		children: React.ReactNode;
		className?: string;
	}>;
