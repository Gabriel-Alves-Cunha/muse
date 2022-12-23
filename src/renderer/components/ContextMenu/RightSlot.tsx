export const RightSlot = ({ ...props }: Props) => (
	<div className="ctx-menu-item-slot" {...props} />
);

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;
