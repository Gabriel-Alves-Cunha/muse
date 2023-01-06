import type { ValuesOf } from "@common/@types/utils";

import { type ReactNode, Suspense, lazy } from "react";
import { CtxMenu } from "./index_";

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
	onContextMenu,
	contentClass,
	onOpenChange,
	children,
}: Props) => (
	<CtxMenu
		contentClassName={contentClass} // "min-w-[226px] bg-ctx-menu z-50 rounded-md p-1 shadow-md no-transition"
		onContextMenu={onContextMenu}
		onOpenChange={onOpenChange}
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

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = {
	onContextMenu?: React.MouseEventHandler<HTMLDivElement> | undefined;
	content?: ValuesOf<typeof CtxContentEnum>;
	onOpenChange?(newValue: boolean): void;
	isAllDisabled?: boolean;
	contentClass?: string;
	children: ReactNode;
};
