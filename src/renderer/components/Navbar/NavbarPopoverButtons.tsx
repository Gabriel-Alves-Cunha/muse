import type { IconType } from "react-icons/lib";

import { useState } from "react";

import { Popover } from "@components/Popover";

export function NavbarPopoverButtons({ children, tooltip, size, Icon }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				data-converting-downloading-list-popover-trigger
				onPointerUp={() => setIsOpen(true)}
				data-has-items={size > 0}
				title={tooltip}
			>
				<span data-length={size} />

				<Icon className="w-5 h-5" />
			</button>

			<Popover
				className="left-8 translate-x-1/2 -translate-y-1/2"
				setIsOpen={setIsOpen}
				isOpen={isOpen}
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
