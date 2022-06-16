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

export const ContextMenu = ({ children, content = MAIN }: Props) => (
	<Root>
		<Trigger>{children}</Trigger>

		<Content sideOffset={5}>{contentToShow(content)}</Content>
	</Root>
);

function contentToShow(content: NonNullable<Props["content"]>) {
	switch (content) {
		case FULL_EXAMPLE:
			return <FullExampleCtxMenu />;

		case MAIN:
			return <MainCtxMenu />;

		case MEDIA_OPTIONS:
			return <MediaOptionsCtxMenu />;

		default:
			return assertUnreachable(content);
	}
}

type Props = { content?: ContentEnum; children: ReactNode; };
