import type { BaseHTMLAttributes } from "react";

// TODO
export function MainGridContainer({ children, className = "", ...props }: Props) {
	return (
		<div
			className={"grid-template-for-content-wrapper " + className}
			{...props}
		>
			{children}
		</div>
	);
}

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
}
