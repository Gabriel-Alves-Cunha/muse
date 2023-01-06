export const RightSlot = ({ className = "", ...props }: Props) => (
	<div className={`right-slot ${className}`} {...props} />
);

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;
