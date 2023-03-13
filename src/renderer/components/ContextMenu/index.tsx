import type { ValuesOf } from "@common/@types/Utils";

import { Suspense, type PropsWithoutRef } from "react";

import { SearchMediaOptionsCtxMenu } from "./searchMediaOptionsCtxMenu";
import { CtxMenu, CtxMenuProps } from "./CtxMenu";
import { MediaOptionsCtxMenu } from "./mediaOptionsCtxMenu";
import { allSelectedMedias } from "@contexts/allSelectedMedias";
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
}: PropsWithoutRef<Props>) => (
	<CtxMenu
		wrapperProps={wrapperProps}
		onOpenChange={onOpenChange}
		{...props}
		ctxMenuContent={
			<Suspense>
				{content === SEARCH_MEDIA_OPTIONS ? (
					<SearchMediaOptionsCtxMenu isAllDisabled={isAllDisabled} />
				) : content === MEDIA_OPTIONS ? (
					<MediaOptionsCtxMenu />
				) : (
					<MainCtxMenu />
				)}
			</Suspense>
		}
	/>
);

function onOpenChange(newValue: boolean): void {
	// On close, deselectAllMedias():
	if (!newValue) allSelectedMedias.clear();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Omit<CtxMenuProps, "ctxMenuContent"> & {
	content?: ValuesOf<typeof CtxContentEnum>;
	isAllDisabled?: boolean;
};
