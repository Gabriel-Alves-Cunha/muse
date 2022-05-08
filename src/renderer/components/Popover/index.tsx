import { forwardRef, type Ref, type ReactNode } from "react";
import { PopperContentProps, Trigger, Root } from "@radix-ui/react-popover";

import { StyledArrow, StyledContent } from "./styles";

export const PopoverTrigger = Trigger;
export const Popover = Root;

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
export const PopoverContent = forwardRef(
	({ children, size, ...props }: Props, forwardedRef: Ref<HTMLDivElement>) => (
		<StyledContent size={size} sideOffset={5} {...props} ref={forwardedRef}>
			{children}

			<StyledArrow />
		</StyledContent>
	)
);
PopoverContent.displayName = "PopoverContent";

type Props = PopperContentProps & {
	size: "small" | "medium" | "large";
	children: ReactNode;
};
