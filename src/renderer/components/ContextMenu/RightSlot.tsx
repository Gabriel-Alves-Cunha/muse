export const RightSlot = ({ className = "", ...props }: Props) => (
	<div className={`ctx-menu-item-slot ${className}`} {...props} />
);

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;
