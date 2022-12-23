import type { ValuesOf } from "@common/@types/utils";

import { type ReactNode, Suspense, lazy } from "react";
import { Content, Root, Trigger } from "@radix-ui/react-context-menu";

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
	setIsOpen,
	children,
}: Props) => (
	<Root onOpenChange={setIsOpen} modal>
		<Trigger onContextMenu={onContextMenu}>{children}</Trigger>

		<Content
			className="min-w-[226px] bg-ctx-menu z-50 rounded-md p-1 shadow-md no-transition"
			loop
		>
			<Suspense>
				{content === SEARCH_MEDIA_OPTIONS ? (
					<SearchMediaOptionsCtxMenu isAllDisabled={isAllDisabled} />
				) : content === MEDIA_OPTIONS ? (
					<MediaOptionsCtxMenu />
				) : (
					<MainCtxMenu />
				)}
			</Suspense>
		</Content>
	</Root>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = {
	onContextMenu?: React.PointerEventHandler<HTMLSpanElement>;
	content?: ValuesOf<typeof CtxContentEnum>;
	setIsOpen?(newIsOpen: boolean): void;
	isAllDisabled?: boolean;
	children: ReactNode;
};
