export const MenuItem = ({ className = "", ...props }: MenuItemProps) => (
	<button className={`menu-item ${className}`} role="menuitem" {...props} />
);

interface MenuItemProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {}
