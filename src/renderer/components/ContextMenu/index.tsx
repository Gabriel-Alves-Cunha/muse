import { type ReactNode } from "react";

import { Root, Trigger } from "@radix-ui/react-context-menu";

import { SearchMediaOptionsCtxMenu } from "./searchMediaOptionsCtxMenu";
import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { FullExampleCtxMenu } from "./fullExampleCtxMenu";
import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";

import { Content } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export enum CtxContentEnum {
	SEARCH_MEDIA_OPTIONS,
	MEDIA_OPTIONS,
	FULL_EXAMPLE,
	MAIN,
}

const { MEDIA_OPTIONS, FULL_EXAMPLE, MAIN, SEARCH_MEDIA_OPTIONS } =
	CtxContentEnum;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const ContextMenu = (
	{ children, content = MAIN, onContextMenu, setIsOpen, isAllDisabled = false }:
		Props,
) => (
	<Root onOpenChange={setIsOpen} modal>
		<Trigger onContextMenuCapture={onContextMenu}>{children}</Trigger>

		<Content loop className="notransition">
			{contentToShow(content, isAllDisabled)}
		</Content>
	</Root>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

function contentToShow(
	content: NonNullable<Props["content"]>,
	isAllDisabled: boolean,
) {
	switch (content) {
		case SEARCH_MEDIA_OPTIONS:
			return <SearchMediaOptionsCtxMenu isAllDisabled={isAllDisabled} />;

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

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<
	{
		onContextMenu?: React.MouseEventHandler<HTMLSpanElement>;
		setIsOpen?: (newIsOpen: boolean) => void;
		content?: CtxContentEnum;
		isAllDisabled?: boolean;
		children: ReactNode;
	}
>;
