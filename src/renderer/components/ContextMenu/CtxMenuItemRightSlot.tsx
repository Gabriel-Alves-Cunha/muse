export const CtxMenuItemRightSlot = ({ className = "", ...props }: Props) => (
	<p
		className={"ctx-menu-right-slot " + className}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLParagraphElement>;
