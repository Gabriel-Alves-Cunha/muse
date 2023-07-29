import type { PropsWithoutRef } from "react";

import { SearchMediaOptionsCtxMenu } from "./searchMediaOptionsCtxMenu";
import { clearAllSelectedMedias } from "@contexts/allSelectedMedias";
import { CtxMenu, CtxMenuProps } from "./CtxMenu";
import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { MainCtxMenu } from "./mainCtxMenu";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const CtxContentEnum = {
	SEARCH_MEDIA_OPTIONS: 2,
	MEDIA_OPTIONS: 3,
	MAIN: 4,
} as const;

const { MEDIA_OPTIONS, MAIN, SEARCH_MEDIA_OPTIONS } = CtxContentEnum;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const ContextMenu = ({
	isAllDisabled = false,
	content = MAIN,
	wrapperProps,
	...props
}: PropsWithoutRef<Props>): JSX.Element => (
	<CtxMenu
		wrapperProps={wrapperProps}
		onOpenChange={onOpenChange}
		{...props}
		ctxMenuContent={
			content === SEARCH_MEDIA_OPTIONS ? (
				<SearchMediaOptionsCtxMenu isAllDisabled={isAllDisabled} />
			) : content === MEDIA_OPTIONS ? (
				<MediaOptionsCtxMenu />
			) : (
				<MainCtxMenu />
			)
		}
	/>
);

function onOpenChange(newValue: boolean): void {
	// On close, deselectAllMedias():
	if (newValue === false) clearAllSelectedMedias();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type CtxContentEnumType = typeof CtxContentEnum;

type DivProps = Omit<CtxMenuProps, "ctxMenuContent">;

interface Props extends Omit<DivProps, "content"> {
	content?: CtxContentEnumType[keyof CtxContentEnumType];
	isAllDisabled?: boolean;
}
