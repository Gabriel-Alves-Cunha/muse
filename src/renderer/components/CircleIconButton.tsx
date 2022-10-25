import type { ButtonHTMLAttributes } from "react";

export function CircleIconButton(
	{ children, className = "", variant = "small", ...props }: Props,
) {
	return (
		<button
			className={"relative flex justify-center items-center cursor-pointer bg-none rounded-full border-none disabled:cursor-default disabled:bg-none [&_svg]:disabled:text-icon-deactivated [&_svg]:text-icon-media-player hover:bg-icon-button-hovered focus:bg-icon-button-hovered " +
				variant +
				" " +
				className}
			{...props}
		>
			{children}
		</button>
	);
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	readonly variant?: "small" | "large";
	readonly children: React.ReactNode;
}
