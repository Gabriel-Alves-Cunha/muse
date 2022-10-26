import type { BaseHTMLAttributes } from "react";

export function LeftSlot({ children, className = "", ...props }: Props) {
	return (
		<div
			className={"flex justify-left items-center gap-4 last:pr-4 " + className}
			{...props}
		>
			{children}
		</div>
	);
}

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
}
