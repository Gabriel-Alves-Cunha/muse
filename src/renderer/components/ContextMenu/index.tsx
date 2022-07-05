import { type ReactNode } from "react";

import { Root, Trigger } from "@radix-ui/react-context-menu";

import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { FullExampleCtxMenu } from "./fullExampleCtxMenu";
import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";

import { Content } from "./styles";

export enum ContentEnum {
	MEDIA_OPTIONS,
	FULL_EXAMPLE,
	MAIN,
}

const { MEDIA_OPTIONS, FULL_EXAMPLE, MAIN } = ContentEnum;

export const ContextMenu = (
	{ children, content = MAIN, onContextMenu, setIsOpen }: Props,
) => (
	<Root onOpenChange={setIsOpen}>
		<Trigger onContextMenuCapture={onContextMenu}>{children}</Trigger>

		<Content sideOffset={5}>{contentToShow(content)}</Content>
	</Root>
);

function contentToShow(content: NonNullable<Props["content"]>) {
	switch (content) {
		case MEDIA_OPTIONS:
			return <MediaOptionsCtxMenu />;

		case FULL_EXAMPLE:
			return <FullExampleCtxMenu />;

		case MAIN:
			return <MainCtxMenu />;

		default:
			return assertUnreachable(content);
	}
}

type Props = Readonly<
	{
		onContextMenu?: React.MouseEventHandler<HTMLSpanElement>;
		setIsOpen?: (newIsOpen: boolean) => void;
		content?: ContentEnum;
		children: ReactNode;
	}
>;
