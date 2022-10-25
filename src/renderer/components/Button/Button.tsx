import { forwardRef, type Ref, type BaseHTMLAttributes } from "react";

export const Button = forwardRef(function Button(
	{ className = "", children, variant, ...props }: Props,
	forwardedRef: Ref<HTMLButtonElement>,
) {
	return (
		<button
			className={"flex justify-center items-center gap-4 whitespace-nowrap font-secondary tracking-wider font-medium border-accent border-solid border-2 bg-none rounded-md hover:bg-accent hover:text-white focus:bg-accent focus:text-white [&_input]:hidden h-12 w-full mt-5 mx-auto mb-0 p-3 " +
				className +
				" " +
				variant}
			{...props}
			ref={forwardedRef}
		>
			{children}
		</button>
	);
});

// export const Button = forwardRef(function Button(
// 	{ className, children, variant, ...props }: Props,
// 	forwardedRef: Ref<HTMLButtonElement>,
// ) {
// 	return (
// 		<GenericBorderedButton
// 			className={className + " " + variant}
// 			{...props}
// 			ref={forwardedRef}
// 		>
// 			{children}
// 		</GenericBorderedButton>
// 	);
// });

// const GenericBorderedButton = styled("button", {
// 	dflex: "center",
// 	gap: 16,
//
// 	// Variants:
// 	"&.large": { w: 300, h: 50, m: "40 auto 0", p: 16, br: 7 },
//
// 	"&.medium": { w: "100%", h: 50, m: "20 auto 0", p: 10, br: 5 },
//
// 	"&.input": { // TODO: Ver isso ao vivo
// 		w: "calc(100% - 115px)", // magic number that I found to work to keep it's size equal to the other inputs...
// 		h: 35,
//
// 		b: "2px solid $input-border",
// 		br: 12,
//
// 		transitionProperty: "border-color, background",
// 		transition: "250ms ease",
//
// 		"&:hover, &:focus": {
// 			borderColor: "$input-border-active",
// 			bg: "$input-border-active",
// 			c: "white",
// 		},
// 	},
// 	//
//
// 	whiteSpace: "nowrap", // keep it one line!
// 	ff: "$secondary",
// 	ls: "0.04rem",
// 	fs: "1rem",
// 	c: "$text", // TODO: Falta isso no tailwind
// 	fw: 500,
//
// 	b: "2px solid $accent", // TODO: Falta isso no tailwind
// 	cursor: "pointer",
// 	bg: "none",
// 	br: 7,
//
// 	transition: "$bgc", // TODO: Falta isso no tailwind
//
// 	"&:hover, &:focus": { bg: "$accent", c: "white" },
//
// 	input: { d: "none" },
//
// 	/////////////////////////////////////////////
// 	// Additional classes
//
// 	"&.file-present": {
// 		bg: "rgb(0, 255, 89)",
// 		c: "black",
//
// 		transition: "border-color 250ms ease",
//
// 		"&:hover, &:focus": { bg: "$input-border-active", c: "white" },
// 	},
// });

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface Props extends BaseHTMLAttributes<HTMLButtonElement> {
	readonly variant: "large" | "medium" | "input";
	readonly children: React.ReactNode;
	readonly className?: string;
}
