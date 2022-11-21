export const RightSlot = ({ ...props }: Props) => (
	<div
		className="absolute right-0 flex justify-end items-center gap-4 last:pr-4 text-alternative tracking-wider"
		{...props}
	/>
);

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;
