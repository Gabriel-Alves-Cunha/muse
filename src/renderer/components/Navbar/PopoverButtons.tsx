import type { IconType } from "react-icons/lib";

import { PopoverContent, PopoverTrigger } from "@components/Popover";

export const PopoverButtons = ({
	popoverId,
	children,
	tooltip,
	size,
	Icon,
}: Props) => (
	<>
		<PopoverTrigger
			labelClassName={`${
				size > 0 ? "has-items" : ""
			} converting-downloading-list-popover-trigger`}
			htmlTargetName={popoverId}
			title={tooltip}
		>
			<span data-length={size} />

			<Icon className="w-5 h-5" />
		</PopoverTrigger>

		<PopoverContent
			className="translate-x-1/2 -translate-y-1/2"
			htmlFor={popoverId}
			size={
				size === 0
					? "nothing-found-for-convertions-or-downloads"
					: "convertions-or-downloads"
			}
		>
			{children}
		</PopoverContent>
	</>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = {
	children: React.ReactNode;
	popoverId: string;
	tooltip: string;
	Icon: IconType;
	size: number;
};
