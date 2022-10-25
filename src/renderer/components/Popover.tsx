import { type Ref, forwardRef, BaseHTMLAttributes } from "react";
import { Content } from "@radix-ui/react-popover";
import { Root } from "@radix-ui/react-popover";

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
export const PopoverContent = forwardRef((
	{ children, size, ...props }: Props,
	forwardedRef: Ref<HTMLDivElement>,
): JSX.Element => (
	<Content
		// 	"& > p": {
		// 		pos: "relative",
		//
		// 		c: "$deactivated-icon",
		// 		ff: "$secondary",
		// 		ls: "0.03rem",
		// 		fs: "1.05rem",
		// 		ta: "center",
		// 		fw: 500,
		// 	},
		className={"flex flex-col gap-3 bg-popover overflow-x-hidden rounded-xl shadow-popover z-10 scroll scroll-1 focus:shadow-popover focus:outline-none " +
			size}
		sideOffset={10}
		{...props}
		ref={forwardedRef}
	>
		{children}
	</Content>
));
PopoverContent.displayName = "PopoverContent";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface Props extends BaseHTMLAttributes<HTMLDivElement> {
	readonly children: React.ReactNode;
	readonly size:
		| "nothing-found-for-convertions-or-downloads"
		| "nothing-found-for-search-media"
		| "convertions-or-downloads"
		| "search-media-results";
}
