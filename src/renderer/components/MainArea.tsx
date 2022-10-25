// import { styled } from "@styles/global";
//
// export const MainArea = styled("main", {
// 	gridArea: "main-area",
//
// 	position: "relative",
// 	d: "inline-block",
// 	alignSelf: "stretch", // for grid: column
// 	size: "100%",
//
// 	p: "5%",
// 	pt: 0,
//
// 	"@sm": { header: { justifyContent: "center" } },
// });

import type { BaseHTMLAttributes } from "react";

export function MainArea({ children, className = "", ...props }: Props) {
	return (
		<main
			className={"relative inline-block self-stretch w-full h-full p-[5%] pt-0 [&_header]:sm:justify-center " +
				className}
			{...props}
		>
			{children}
		</main>
	);
}

interface Props extends BaseHTMLAttributes<HTMLButtonElement> {
	readonly children: React.ReactNode;
}
