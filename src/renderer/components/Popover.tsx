import { forwardRef } from "react";
import {
	type PopoverContentProps,
	Content,
	Root,
} from "@radix-ui/react-popover";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const PopoverRoot = Root;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:size

/** Usage:
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
export const PopoverContent = forwardRef(function PopoverContent(
	{ size, ...props }: Props,
	forwardedRef: React.Ref<HTMLDivElement>,
): JSX.Element {
	return (
		<Content
			className={"popover " + size}
			sideOffset={10}
			{...props}
			ref={forwardedRef}
		/>
	);
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface Props extends PopoverContentProps {
	readonly size:
		| "nothing-found-for-convertions-or-downloads"
		| "nothing-found-for-search-media"
		| "convertions-or-downloads"
		| "search-media-results";
}
