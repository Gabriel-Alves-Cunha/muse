import {
	type MenuItemProps,
	Item as CtxItem,
} from "@radix-ui/react-context-menu";

export const itemStyles =
	"unset-all relative flex items-center h-6 cursor-pointer py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide text-base leading-none select-none disabled:text-disabled disabled:pointer-events-none hover:text-ctx-menu-item-focus hover:bg-ctx-menu-item-focus focus:text-ctx-menu-item-focus focus:bg-ctx-menu-item-focus ";

export const Item = (
	{ className = "", ...props }: Props,
) => (
	<CtxItem
		className={"unset-all relative flex items-center h-6 cursor-pointer py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide text-base leading-none select-none disabled:text-disabled disabled:pointer-events-none hover:text-ctx-menu-item-focus hover:bg-ctx-menu-item-focus focus:text-ctx-menu-item-focus focus:bg-ctx-menu-item-focus " +
			className}
		{...props}
	/>
);

interface Props extends MenuItemProps {
	readonly variant?: "small" | "large";
}
