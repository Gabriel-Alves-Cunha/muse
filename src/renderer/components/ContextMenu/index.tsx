import type { ReactNode } from "react";
import type { ValuesOf } from "@common/@types/utils";

import { Content, Root, Trigger } from "@radix-ui/react-context-menu";

import { SearchMediaOptionsCtxMenu } from "./searchMediaOptionsCtxMenu";
import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { FullExampleCtxMenu } from "./fullExampleCtxMenu";
import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const ctxContentEnum = {
	SEARCH_MEDIA_OPTIONS: 2,
	MEDIA_OPTIONS: 3,
	FULL_EXAMPLE: 4,
	MAIN: 5,
} as const;

const { MEDIA_OPTIONS, FULL_EXAMPLE, MAIN, SEARCH_MEDIA_OPTIONS } =
	ctxContentEnum;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const ContextMenu = ({
	children,
	content = MAIN,
	onContextMenu,
	setIsOpen,
	isAllDisabled = false,
}: Props) => (
	<Root onOpenChange={setIsOpen} modal>
		<Trigger onContextMenuCapture={onContextMenu}>{children}</Trigger>

		<Content
			className="min-w-[226px] bg-ctx-menu z-50 rounded-md p-1 shadow-md no-transition"
			loop
		>
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

type Props = Readonly<{
	onContextMenu?: React.PointerEventHandler<HTMLSpanElement>;
	setIsOpen?: (newIsOpen: boolean) => void;
	content?: ValuesOf<typeof ctxContentEnum>;
	isAllDisabled?: boolean;
	children: ReactNode;
}>;
