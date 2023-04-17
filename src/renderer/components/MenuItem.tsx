export const MenuItem = (props: Props): JSX.Element => (
	<button data-menu-item {...props} />
);

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>;
