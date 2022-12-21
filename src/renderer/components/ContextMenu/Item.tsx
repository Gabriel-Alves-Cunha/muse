import {
	type MenuItemProps,
	Item as CtxItem,
} from "@radix-ui/react-context-menu";

export const Item = ({ className = "", ...props }: Props) => (
	<CtxItem className={`ctx-menu-item ${className}`} {...props} />
);

interface Props extends MenuItemProps {
	readonly variant?: "small" | "large";
}
