import { type ReactNode } from "react";

import {
	type TooltipContentProps,
	Provider,
	Trigger,
	Root,
} from "@radix-ui/react-tooltip";

import { StyledContent } from "./styles";

export const Tooltip = ({ side = "bottom", children, text }: Props) => (
	<Provider delayDuration={500} skipDelayDuration={300}>
		<Root>
			<Trigger asChild>{children}</Trigger>

			<StyledContent
				collisionTolerance={20}
				sideOffset={5}
				align="center"
				side={side}
			>
				{text}
			</StyledContent>
		</Root>
	</Provider>
);

type Props = {
	side?: TooltipContentProps["side"];
	children: ReactNode;
	arrow?: boolean;
	text: string;
};

Tooltip.whyDidYouRender = {
	customName: "Tooltip",
};
