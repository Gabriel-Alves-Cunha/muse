import type { DateAsNumber, Media, Path } from "types/generalTypes";

import { MdSearchOff as NoMediaFound } from "react-icons/md";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { isCtxMenuOpen, setIsCtxMenuOpen, useFromList } from "./states";
import { CtxContentEnum, ContextMenu } from "../ContextMenu";
import { itemContent, leftClick } from "./Row";
import { resetAllAppData } from "@utils/app";
import { useTranslation } from "@i18n";
import { ErrorFallback } from "../ErrorFallback";
import { playlistList } from "@utils/enums";
import { on, removeOn } from "@utils/window";
import { error } from "@utils/log";
import { time } from "@utils/utils";
import {
	getAllSelectedMedias,
	deselectAllMedias,
} from "@contexts/useAllSelectedMedias";
import {
	type MainList,
	type History,
	usePlaylists,
	getMainList,
	removeMedia,
} from "@contexts/usePlaylists";
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
				description={useTranslation().t(
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
	const { fromList, homeList } = useFromList();
	const listRef = useRef<HTMLDivElement>(null);

	// isHome is used to determine which list to use
	// when the user is at the home page, the homeList is used
	// then, cause it will have what the user has last set as the main list:
	// either sortedByDate or sortedByName, in our current case.
	const listName = isHome ? homeList : fromList;
	const { [listName]: list } = usePlaylists();

	const listAsArrayOfAMap: readonly [Path, Media, DateAsNumber][] = useMemo(
		() =>
			time(() => {
				if (listName === playlistList.mainList)
					return Array.from(list as MainList, ([path, media]) => [
						path,
						media,
						0,
					]);

				if (
					listName === playlistList.sortedByDate ||
					listName === playlistList.favorites
				) {
					const listAsArrayOfAMap: [Path, Media, DateAsNumber][] = [];
					const mainList = getMainList();

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
				const mainList = getMainList();

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
		useFromList.setState({ isHome });
	}, [isHome]);

	useEffect(() => {
		function handleDeselectAllMedias(event: MouseEvent) {
			const isClickOutsideValid =
				event.button !== leftClick ||
				!listRef.current ||
				listRef.current.contains(event.target as Node);

			if (!isClickOutsideValid) return;

			if (!isCtxMenuOpen() && getAllSelectedMedias().size > 0)
				deselectAllMedias();
		}

		on("click", handleDeselectAllMedias);
		on("keyup", selectAllMediasOnCtrlPlusA);

		return () => {
			removeOn("click", handleDeselectAllMedias);
			removeOn("keyup", selectAllMediasOnCtrlPlusA);
		};
	}, []);

	return (
		// For some reason (CSS) 87% is the spot that makes the header above it have it's target size (h-14 === 3.5rem)
		<ContextMenu
			wrapperProps={{ className: "max-w-2xl h-[87%]", ref: listRef }}
			onContextMenu={selectMediaByPointerEvent}
			content={CtxContentEnum.MEDIA_OPTIONS}
			onOpenChange={setIsCtxMenuOpen}
		>
			<Virtuoso
				computeItemKey={
					listName === playlistList.history
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

const Footer = () => <div className="relative w-2 h-2 bg-none" />;

const EmptyPlaceholder = () => (
	<div className="empty-placeholder">
		<NoMediaFound className="w-14 h-14 mr-5" />

		{useTranslation().t("alts.noMediasFound")}
	</div>
);

const components = { EmptyPlaceholder, Header: Footer, Footer };

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = { isHome?: boolean | undefined };
