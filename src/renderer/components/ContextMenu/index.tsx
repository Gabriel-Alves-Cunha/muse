import type { Component, JSX, Setter } from "solid-js";
import type { ValuesOf } from "@common/@types/utils";

import { SearchMediaOptionsCtxMenu } from "./searchMediaOptionsCtxMenu";
import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { assertUnreachable } from "@utils/utils";
import { MainCtxMenu } from "./mainCtxMenu";
import { Dialog } from "@components/Dialog";

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

export const ContextMenu: Component<Props> = (props) => {
	return (
		<Dialog
			class="min-w-[226px] bg-ctx-menu z-50 rounded-md p-1 shadow-md no-transition"
			setIsOpen={props.setIsOpen}
			isOpen={props.isOpen}
			modal
		>
			{contentToShow(props.content ?? MAIN, Boolean(props.isAllDisabled))}
		</Dialog>
	);
};

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

type Props = {
	onContextMenu?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
	content?: ValuesOf<typeof ctxContentEnum>;
	setIsOpen: Setter<boolean>;
	isAllDisabled?: boolean;
	children: JSX.Element;
	isOpen: boolean;
};
