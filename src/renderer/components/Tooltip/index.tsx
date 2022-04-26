import { type ReactNode } from "react";

import {
	type TooltipContentProps,
	Trigger,
	Root,
} from "@radix-ui/react-tooltip";

import { StyledArrow, StyledContent } from "./styles";

export const Tooltip = ({
	side = "bottom",
	arrow = true,
	children,
	text,
}: Props) => (
	<Root>
		<Trigger asChild>{children}</Trigger>

		<StyledContent
			collisionTolerance={20}
			sideOffset={5}
			align="center"
			side={side}
		>
			{text}

			{arrow && <StyledArrow />}
		</StyledContent>
	</Root>
);

type Props = {
	side?: TooltipContentProps["side"];
	children: ReactNode;
	arrow?: boolean;
	text: string;
};
