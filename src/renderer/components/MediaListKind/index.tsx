import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { MdSearchOff as NoMediaFound } from "react-icons/md";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { ctxContentEnum, ContextMenu } from "@components/ContextMenu";
import { assertUnreachable, time } from "@utils/utils";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { resetAllAppData } from "@utils/app";
import { t, Translator } from "@components/I18n";
import { ErrorFallback } from "../ErrorFallback";
import {
	getAllSelectedMedias,
	deselectAllMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";
import {
	type MainList,
	type History,
	usePlaylists,
	PlaylistList,
	getMainList,
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

export const MediaListKind = ({ isHome }: Props) => (
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
	const listName = isHome === true ? homeList : fromList;
	const { [listName]: list } = usePlaylists();

	const listAsArrayOfAMap: readonly [Path, Media, DateAsNumber][] = useMemo(
		() =>
			time(() => {
				switch (listName) {
					case PlaylistList.MAIN_LIST:
						return Array.from(list as MainList, ([path, media]) => [
							path,
							media,
							0,
						]);

					case PlaylistList.SORTED_BY_DATE:
					case PlaylistList.FAVORITES: {
						const mainList = getMainList();

						const listAsArrayOfAMap: [Path, Media, DateAsNumber][] = Array.from(
							list as ReadonlySet<Path>,
							(path) => {
								const media = mainList.get(path);

								if (media === undefined)
									throw new Error(
										`Tried to access inexistent media with path = "${path}"`,
									);

								return [path, media, 0];
							},
						);

						return listAsArrayOfAMap;
					}

					case PlaylistList.HISTORY: {
						const unsortedList: [Path, DateAsNumber][] = [];

						(list as History).forEach((dates, path) =>
							dates.forEach((date) => unsortedList.push([path, date])),
						);

						const mainList = getMainList();

						const listAsArrayOfMap: [Path, Media, DateAsNumber][] = unsortedList
							.sort((a, b) => b[1] - a[1]) // sorted by date
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							.map(([path, date]) => [path, mainList.get(path)!, date]);

						return listAsArrayOfMap;
					}

					default:
						return assertUnreachable(listName);
				}
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
						listName === PlaylistList.HISTORY
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
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const Footer = () => <div className="relative w-2 h-2 bg-none" />;

const EmptyPlaceholder = () => (
	<div className="absolute flex justify-center items-center center text-alternative font-secondary tracking-wider text-lg font-medium">
		{/* <img
			alt={t("alts.noMediasFound")}
			className="w-14 h-14 mr-5"
			src={noMediaFoundPng}
		/> */}
		<NoMediaFound className="w-14 h-14 mr-5" />

		<Translator path="alts.noMediasFound" />
	</div>
);

const components = { EmptyPlaceholder, Header: Footer, Footer };

/////////////////////////////////////////

function selectAllMediasOnCtrlPlusA(e: KeyboardEvent) {
	if (
		e.ctrlKey === true &&
		e.key === "a" &&
		isAModifierKeyPressed(e, ["Control"]) === false
	) {
		e.preventDefault();
		selectAllMedias();
	}
}

/////////////////////////////////////////

function handleDeselectAllMedias() {
	if (isCtxMenuOpen() === false && getAllSelectedMedias().size > 0)
		deselectAllMedias();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ isHome?: boolean | undefined }>;
