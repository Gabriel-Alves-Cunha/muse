export const RightSlot = (props: Props): JSX.Element => (
	<div data-right-slot {...props} />
);

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;
