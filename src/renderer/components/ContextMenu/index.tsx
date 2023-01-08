import type { ValuesOf } from "@common/@types/utils";
import { deselectAllMedias } from "@contexts/useAllSelectedMedias";

import { Suspense, lazy } from "react";

import { CtxMenu, CtxMenuProps } from "./CtxMenu";

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
	children,
	...props
}: Props) => (
	<CtxMenu
		wrapperProps={wrapperProps}
		onOpenChange={onOpenClose}
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
	>
		{children}
	</CtxMenu>
);

function onOpenClose(newValue: boolean): void {
	if (!newValue) deselectAllMedias();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Omit<CtxMenuProps, "ctxMenuContent"> & {
	content?: ValuesOf<typeof CtxContentEnum>;
	children: React.ReactNode;
	isAllDisabled?: boolean;
};
