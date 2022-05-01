import { type ReactNode } from "react";

import { Root, Trigger } from "@radix-ui/react-context-menu";

import { FullExampleCtxMenu } from "./fullExampleCtxMenu";
import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";

import { Content, Box } from "./styles";

export enum ContentEnum {
	FULL_EXAMPLE,
	MAIN,
}

const { FULL_EXAMPLE, MAIN } = ContentEnum;

export const ContextMenu = ({ children, content = FULL_EXAMPLE }: Props) => (
	<Box>
		<Root>
			<Trigger>{children}</Trigger>

			<Content sideOffset={5}>{contentToShow(content)}</Content>
		</Root>
	</Box>
);

const contentToShow = (content: NonNullable<Props["content"]>) => {
	switch (content) {
		case FULL_EXAMPLE:
			return <FullExampleCtxMenu />;

		case MAIN:
			return <MainCtxMenu />;

		default:
			return assertUnreachable(content);
	}
};

type Props = {
	content?: ContentEnum;
	children: ReactNode;
};

ContextMenu.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "ContextMenu",
};
