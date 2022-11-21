export function RightSlot({ children }: Props) {
	return (
		<div className="absolute right-0 flex justify-end items-center gap-4 last:pr-4 text-alternative tracking-wider">
			{children}
		</div>
	);
}

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;
