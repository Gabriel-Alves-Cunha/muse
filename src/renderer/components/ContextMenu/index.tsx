import { type ReactNode } from "react";

import { Root, Trigger } from "@radix-ui/react-context-menu";

import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";

import { StyledContent, Box } from "./styles";

export enum Content {
	MAIN,
}

const { MAIN } = Content;

export const ContextMenu = ({ children, content = MAIN }: Props) => (
	<Box>
		<Root>
			<Trigger>{children}</Trigger>

			<StyledContent sideOffset={5}>{contentToShow(content)}</StyledContent>
		</Root>
	</Box>
);

const contentToShow = (content: NonNullable<Props["content"]>) => {
	switch (content) {
		case MAIN:
			return <MainCtxMenu />;

		default:
			return assertUnreachable(content);
	}
};

type Props = {
	children: ReactNode;
	content?: Content;
};
