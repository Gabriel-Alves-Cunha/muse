import type { Component, JSX } from "solid-js";

export const Item: Component<Props> = (props) => (
	<option
		class={`unset-all relative flex items-center h-6 cursor-pointer py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide text-base leading-none select-none disabled:text-disabled disabled:pointer-events-none hover:text-ctx-menu-item-focus hover:bg-ctx-menu-item-focus focus:text-ctx-menu-item-focus focus:bg-ctx-menu-item-focus ${
			props.class ?? ""
		}`}
		{...props}
	/>
);

interface Props extends JSX.OptionHTMLAttributes<HTMLOptionElement> {}
