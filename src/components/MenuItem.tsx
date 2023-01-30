export const MenuItem = (props: Props) => <button data-menu-item {...props} />;

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>;
