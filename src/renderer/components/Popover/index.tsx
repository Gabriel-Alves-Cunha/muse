import type { VariantProps, ComponentProps } from "@stitches/react";

import { type Ref, type ReactNode, forwardRef } from "react";
import { Root } from "@radix-ui/react-popover";

import { StyledContent } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const PopoverRoot = Root;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

/** Usage:
 *
 * ``` javascript
 * import { Popover, PopoverTrigger, PopoverContent } from "@components";
 *
 * export default () => (
 * 	<Popover>
 * 		<PopoverTrigger>Popover trigger</PopoverTrigger>
 * 		<PopoverContent size="small">Popover content</PopoverContent>
 * 	</Popover>
 * );
 * ```
 */
export const PopoverContent = forwardRef((
	{ children, size, ...props }: Props,
	forwardedRef: Ref<HTMLDivElement>,
): JSX.Element => (
	<StyledContent size={size} sideOffset={10} {...props} ref={forwardedRef}>
		{children}
	</StyledContent>
));
PopoverContent.displayName = "PopoverContent";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface Props extends ComponentProps<typeof StyledContent> {
	readonly size: NonNullable<VariantProps<typeof StyledContent>["size"]>;
	readonly children: ReactNode;
}
