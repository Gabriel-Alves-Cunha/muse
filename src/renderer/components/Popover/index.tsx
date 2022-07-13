import type { VariantProps } from "@stitches/react";

import { type Ref, type ReactNode, forwardRef } from "react";
import { PopperContentProps, Root } from "@radix-ui/react-popover";

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
) => (
	<StyledContent size={size} sideOffset={10} {...props} ref={forwardedRef}>
		{children}
	</StyledContent>
));
PopoverContent.displayName = "PopoverContent";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props =
	& PopperContentProps
	& Readonly<
		{ size: VariantProps<typeof StyledContent>["size"]; children: ReactNode; }
	>;
