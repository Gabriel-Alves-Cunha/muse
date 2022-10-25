import type { BaseHTMLAttributes } from "react";

export function FlexRow({ className, ...props }: Props) {
	return (
		<div
			className={"flex justify-end gap-5 mt-6 " + className}
			{...props}
		/>
	);
}

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
}
