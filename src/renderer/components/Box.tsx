import type { BaseHTMLAttributes } from "react";

export function Box({ className, ...props }: Props) {
	return (
		<div
			className={"flex justify-center items-center mt-8" + className}
			{...props}
		/>
	);
}

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
}
