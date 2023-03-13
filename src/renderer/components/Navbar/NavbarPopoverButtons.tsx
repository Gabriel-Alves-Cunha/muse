import type { IconType } from "react-icons/lib";

import { useRef, useState } from "react";

import { Popover } from "@components/Popover";

export function NavbarPopoverButtons({ children, tooltip, size, Icon }: Props) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<div ref={contentRef}>
			<button
				onPointerUp={() => setIsPopoverOpen((prev) => !prev)}
				data-converting-downloading-list-popover-trigger
				data-has-items={size > 0}
				title={tooltip}
			>
				<span data-length={size} />

				<Icon className="w-5 h-5" />
			</button>

			{isPopoverOpen && (
				<Popover
					className="translate-x-12 -translate-y-[100%]"
					setIsOpen={setIsPopoverOpen}
					contentRef={contentRef}
					size={
						size === 0
							? "nothing-found-for-convertions-or-downloads"
							: "convertions-or-downloads"
					}
				>
					{children}
				</Popover>
			)}
		</div>
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
