import type { Component, JSX } from "solid-js";
import type { ValuesOf } from "@common/@types/utils";

import { SearchMediaOptionsCtxMenu } from "./searchMediaOptionsCtxMenu";
import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const ctxContentEnum = {
	SEARCH_MEDIA_OPTIONS: 2,
	MEDIA_OPTIONS: 3,
	MAIN: 5,
} as const;

const { MEDIA_OPTIONS, MAIN, SEARCH_MEDIA_OPTIONS } = ctxContentEnum;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const ContextMenu: Component<Props> = (props) => (
	<>
		<Trigger onContextMenuCapture={props.onContextMenu}>
			{props.children}
		</Trigger>

		<Root onOpenChange={props.setIsOpen} modal>
			<Content
				className="min-w-[226px] bg-ctx-menu z-50 rounded-md p-1 shadow-md no-transition"
				loop
			>
				{contentToShow(props.content ?? MAIN, Boolean(props.isAllDisabled))}
			</Content>
		</Root>
	</>
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
	content?: ValuesOf<typeof ctxContentEnum>;
	setIsOpen?: (newIsOpen: boolean) => void;
	onContextMenu?: PointerEvent;
	isAllDisabled?: boolean;
	children: JSX.Element;
}>;
