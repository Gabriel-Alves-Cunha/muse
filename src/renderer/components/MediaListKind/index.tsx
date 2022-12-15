import type {
	DateAsNumber,
	Media,
	Path,
	ID,
} from "@common/@types/generalTypes";

import { MdSearchOff as NoMediaFound } from "react-icons/md";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { ctxContentEnum, ContextMenu } from "@components/ContextMenu";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { resetAllAppData } from "@utils/app";
import { useTranslation } from "@i18n";
import { ErrorFallback } from "../ErrorFallback";
import { playlistList } from "@common/enums";
import { error } from "@utils/log";
import { time } from "@utils/utils";
import {
	getAllSelectedMedias,
	deselectAllMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";
import {
	type MainList,
	type History,
	usePlaylists,
	getMainList,
	removeMedia,
} from "@contexts/usePlaylists";
import {
	selectMediaByPointerEvent,
	computeHistoryItemKey,
	setIsCtxMenuOpen,
	computeItemKey,
	isCtxMenuOpen,
	reloadWindow,
	itemContent,
	useFromList,
} from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function MediaListKind({ isHome }: Props) {
	const { t } = useTranslation();

	return (
		<ErrorBoundary
			FallbackComponent={() => (
				<ErrorFallback
					description={t("errors.mediaListKind.errorFallbackDescription")}
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
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const MediaListKindWithoutErrorBoundary = ({ isHome = false }: Props) => {
	const { fromList, homeList } = useFromList();
	const listRef = useRef<HTMLDivElement>(null);

	// isHome is used to determine which list to use
	// when the user is at the home page, the homeList is used
	// then, cause it will have what the user has last set as the main list:
	// either sortedByDate or sortedByName, in our current case.
	const listName = isHome ? homeList : fromList;
	const { [listName]: list } = usePlaylists();

	const listAsArrayOfAMap: readonly [ID, Media, DateAsNumber][] = useMemo(
		() =>
			time(() => {
				if (listName === playlistList.mainList)
					return Array.from(list as MainList, ([id, media]) => [id, media, 0]);

				if (
					listName === playlistList.sortedByDate ||
					listName === playlistList.favorites
				) {
					const listAsArrayOfAMap: [ID, Media, DateAsNumber][] = [];
					const mainList = getMainList();

					for (const id of list as ReadonlySet<ID>) {
						const media = mainList.get(id);

						if (!media) {
							error(
								`Tried to access inexistent media with id = "${id}". Erasing from mainList...`,
							);
							removeMedia(id);
							continue;
						}

						listAsArrayOfAMap.push([id, media, 0]);
					}

					return listAsArrayOfAMap;
				}

				// else if (listName === playlistList.history)
				const unsortedList: [Path, Media, DateAsNumber][] = [];
				const mainList = getMainList();

				for (const [id, dates] of list as History) {
					const media = mainList.get(id);

					if (!media) {
						error(
							`Tried to access inexistent media with id = "${id}". Erasing from mainList...`,
						);
						removeMedia(id);
						continue;
					}

					for (const date of dates) unsortedList.push([id, media, date]);
				}

				const sorted: [Path, Media, DateAsNumber][] = unsortedList.sort(
					(a, b) => b[2] - a[2],
				); // sorted by date

				return sorted;
			}, "listAsArrayOfAMap"),
		[listName, list],
	);

	useOnClickOutside(listRef, handleDeselectAllMedias);

	useEffect(() => useFromList.setState({ isHome }), [isHome]);

	useEffect(() => {
		document.addEventListener("keydown", selectAllMediasOnCtrlPlusA);

		return () =>
			document.removeEventListener("keydown", selectAllMediasOnCtrlPlusA);
	}, []);

	return (
		// For some reason (CSS) 87% is the spot that makes the header above it have it's target size (h-14 === 3.5rem)
		<div className="max-w-2xl h-[87%]" ref={listRef}>
			<ContextMenu
				onContextMenu={selectMediaByPointerEvent}
				content={ctxContentEnum.MEDIA_OPTIONS}
				setIsOpen={setIsCtxMenuOpen}
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
					fixedItemHeight={65}
					className="list"
					overscan={15}
					noValidate
				/>
			</ContextMenu>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const Footer = () => <div className="relative w-2 h-2 bg-none" />;

const EmptyPlaceholder = () => {
	const { t } = useTranslation();

	return (
		<div className="absolute flex justify-center items-center center text-alternative font-secondary tracking-wider text-lg font-medium">
			<NoMediaFound className="w-14 h-14 mr-5" />

			{t("alts.noMediasFound")}
		</div>
	);
};

const components = { EmptyPlaceholder, Header: Footer, Footer };

/////////////////////////////////////////

const selectAllMediasOnCtrlPlusA = (e: KeyboardEvent) => {
	if (e.ctrlKey && e.key === "a" && !isAModifierKeyPressed(e, ["Control"])) {
		e.preventDefault();
		selectAllMedias();
	}
};

/////////////////////////////////////////

const handleDeselectAllMedias = () => {
	if (!isCtxMenuOpen() && getAllSelectedMedias().size > 0) deselectAllMedias();
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = { isHome?: boolean | undefined };
