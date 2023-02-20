import type { IconType } from "react-icons/lib";

import { useState } from "react";

import { Popover } from "@components/Popover";

export function NavbarPopoverButtons({ children, tooltip, size, Icon }: Props) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	return (
		<>
			<button
				data-converting-downloading-list-popover-trigger
				onPointerUp={() => setIsPopoverOpen(true)}
				data-has-items={size > 0}
				title={tooltip}
			>
				<span data-length={size} />

				<Icon className="w-5 h-5" />
			</button>

			<Popover
				className="translate-x-[61%] -translate-y-1/2"
				setIsOpen={setIsPopoverOpen}
				isOpen={isPopoverOpen}
				size={
					size === 0
						? "nothing-found-for-convertions-or-downloads"
						: "convertions-or-downloads"
				}
			>
				{children}
			</Popover>
		</>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = {
	children: React.ReactNode;
	tooltip: string;
	Icon: IconType;
	size: number;
};
