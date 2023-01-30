import type { ValuesOf } from "@renderer/common/@types/utils";

import { Suspense, lazy } from "react";

import { CtxMenu, CtxMenuProps } from "./CtxMenu";
import { deselectAllMedias } from "@contexts/useAllSelectedMedias";

const MediaOptionsCtxMenu = lazy(() => import("./mediaOptionsCtxMenu"));
const MainCtxMenu = lazy(() => import("./mainCtxMenu"));
const SearchMediaOptionsCtxMenu = lazy(
	() => import("./searchMediaOptionsCtxMenu"),
);

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
}: Props) => (
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
	if (!newValue) deselectAllMedias();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Omit<CtxMenuProps, "ctxMenuContent"> & {
	content?: ValuesOf<typeof CtxContentEnum>;
	isAllDisabled?: boolean;
};
