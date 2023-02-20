import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { MdSearchOff as NoMediaFound } from "react-icons/md";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSnapshot } from "valtio";
import { Virtuoso } from "react-virtuoso";

import { CtxContentEnum, ContextMenu } from "../ContextMenu";
import { isCtxMenuOpen, fromList } from "./states";
import { itemContent, leftClick } from "./Row";
import { PlaylistListEnum } from "@common/enums";
import { resetAllAppData } from "@utils/app";
import { ErrorFallback } from "../ErrorFallback";
import { on, removeOn } from "@utils/window";
import { translation } from "@i18n";
import { error } from "@common/log";
import { time } from "@utils/utils";
import {
	allSelectedMedias,
	deselectAllMedias,
} from "@contexts/allSelectedMedias";
import {
	type MainList,
	type History,
	removeMedia,
	playlists,
} from "@contexts/playlists";
import {
	selectAllMediasOnCtrlPlusA,
	selectMediaByPointerEvent,
	computeHistoryItemKey,
	computeItemKey,
	reloadWindow,
} from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const MediaListKind = ({ isHome }: Props) => (
	<ErrorBoundary
		FallbackComponent={() => (
			<ErrorFallback
				description={translation.t(
					"errors.mediaListKind.errorFallbackDescription",
				)}
			/>
		)}
		onReset={() => {
			resetAllAppData();
			reloadWindow();
		}}
	>
		<MediaListKindWithoutErrorBoundary isHome={isHome} />
	</ErrorBoundary>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

function MediaListKindWithoutErrorBoundary({ isHome = false }: Props) {
	const fromListAccessor = useSnapshot(fromList);
	const listRef = useRef<HTMLDivElement>(null);

	// isHome is used to determine which list to use
	// when the user is at the home page, the homeList is used
	// then, cause it will have what the user has last set as the main list:
	// either sortedByDate or sortedByName, in our current case.
	const listName = isHome ? fromListAccessor.homeList : fromListAccessor.curr;
	const { [listName]: list } = playlists;

	const listAsArrayOfAMap: readonly [Path, Media, DateAsNumber][] = useMemo(
		() =>
			time(() => {
				if (listName === PlaylistListEnum.mainList)
					return Array.from(list as MainList, ([path, media]) => [
						path,
						media,
						0,
					]);

				if (
					listName === PlaylistListEnum.sortedByDate ||
					listName === PlaylistListEnum.favorites
				) {
					const listAsArrayOfAMap: [Path, Media, DateAsNumber][] = [];
					const mainList = playlists.sortedByTitleAndMainList;

					for (const path of list as ReadonlySet<Path>) {
						const media = mainList.get(path);

						if (!media) {
							setTimeout(() => {
								error(`"${path}" not found! Removing from mainList.`);
								removeMedia(path);
							}, 1_000);
							continue;
						}

						listAsArrayOfAMap.push([path, media, 0]);
					}

					return listAsArrayOfAMap;
				}

				// Else if (listName === playlistList.history)
				const unsortedList: [Path, Media, DateAsNumber][] = [];
				const mainList = playlists.sortedByTitleAndMainList;

				for (const [path, dates] of list as History) {
					const media = mainList.get(path);

					if (!media) {
						setTimeout(() => {
							error(`"${path}" not found. Removing from mainList.`);
							removeMedia(path);
						}, 1_000);
						continue;
					}

					for (const date of dates) unsortedList.push([path, media, date]);
				}

				const sorted: [Path, Media, DateAsNumber][] = unsortedList.sort(
					(a, b) => b[2] - a[2],
				); // sorted by date

				return sorted;
			}, "listAsArrayOfAMap"),
		[listName, list],
	);

	useEffect(() => {
		fromList.isHome = isHome;
	}, [isHome]);

	useEffect(() => {
		function handleDeselectAllMedias(event: PointerEvent) {
			const isClickOutsideValid =
				event.button !== leftClick ||
				!listRef.current ||
				listRef.current.contains(event.target as Node);

			if (!isClickOutsideValid) return;

			if (!isCtxMenuOpen && allSelectedMedias.size > 0) deselectAllMedias();
		}

		on("pointerup", handleDeselectAllMedias);
		on("keyup", selectAllMediasOnCtrlPlusA);

		return () => {
			removeOn("pointerup", handleDeselectAllMedias);
			removeOn("keyup", selectAllMediasOnCtrlPlusA);
		};
	}, []);

	return (
		// For some reason (CSS) 87% is the spot that makes the header above it have it's target size (h-14 === 3.5rem)
		<ContextMenu
			wrapperProps={{ className: "max-w-2xl h-[87%]", ref: listRef }}
			onOpenChange={(newValue) => (isCtxMenuOpen.curr = newValue)}
			onContextMenu={selectMediaByPointerEvent}
			content={CtxContentEnum.MEDIA_OPTIONS}
		>
			<Virtuoso
				computeItemKey={
					listName === PlaylistListEnum.history
						? computeHistoryItemKey
						: computeItemKey
				}
				totalCount={listAsArrayOfAMap.length}
				itemContent={itemContent}
				data={listAsArrayOfAMap}
				components={components}
				fixedItemHeight={64}
				className="list"
				overscan={15}
				noValidate
			/>
		</ContextMenu>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const footer = <div className="relative w-2 h-2 bg-none" />;
const Footer = () => footer;

const emptyPlaceholder = (
	<div className="empty-placeholder">
		<NoMediaFound className="w-14 h-14 mr-5" />

		{translation.t("alts.noMediasFound")}
	</div>
);
const EmptyPlaceholder = () => emptyPlaceholder;

const components = { EmptyPlaceholder, Header: Footer, Footer };

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = { isHome?: boolean | undefined };
