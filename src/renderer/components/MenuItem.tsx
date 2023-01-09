export const MenuItem = (props: MenuItemProps) => (
	<button data-menu-item {...props} />
);

type MenuItemProps = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>;
