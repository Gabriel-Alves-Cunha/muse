import { BaseHTMLAttributes } from "react";

export function Header({ children, className, ...props }: Props) {
	return (
		<header
			className={"relative flex justify-between items-center h-14 gap-4 mb-[5%] mt-3 " +
				className}
			{...props}
		>
			{children}
		</header>
	);
}

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
}
