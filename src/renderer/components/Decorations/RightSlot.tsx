import type { BaseHTMLAttributes } from "react";

export function RightSlot({ children, className = "", ...props }: Props) {
	return (
		<div
			className={"flex justify-left items-center gap-4 first:pl-4 " + className}
			{...props}
		>
			{children}
		</div>
	);
}

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
}
