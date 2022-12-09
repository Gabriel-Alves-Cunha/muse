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
import { useTranslation } from "@i18n";
import { ErrorFallback } from "../ErrorFallback";
import { playlistList } from "@common/enums";
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

export const MediaListKind = ({ isHome }: Props) => {
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
};

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
				switch (listName) {
					case playlistList.mainList:
						return Array.from(list as MainList, ([path, media]) => [
							path,
							media,
							0,
						]);

					case playlistList.sortedByDate:
					case playlistList.favorites: {
						const mainList = getMainList();

						const listAsArrayOfAMap: [Path, Media, DateAsNumber][] = Array.from(
							list as ReadonlySet<Path>,
							(path) => {
								const media = mainList.get(path);

								if (!media)
									throw new Error(
										`Tried to access inexistent media with path = "${path}"`,
									);

								return [path, media, 0];
							},
						);

						return listAsArrayOfAMap;
					}

					case playlistList.history: {
						const unsortedList: [Path, DateAsNumber][] = [];

						for (const [path, dates] of list as History)
							for (const date of dates) unsortedList.push([path, date]);

						const mainList = getMainList();

						const listAsArrayOfMap: [Path, Media, DateAsNumber][] = unsortedList
							.sort((a, b) => b[1] - a[1]) // sorted by date
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
}

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

function selectAllMediasOnCtrlPlusA(e: KeyboardEvent) {
	if (e.ctrlKey && e.key === "a" && !isAModifierKeyPressed(e, ["Control"])) {
		e.preventDefault();
		selectAllMedias();
	}
}

/////////////////////////////////////////

function handleDeselectAllMedias() {
	if (!isCtxMenuOpen() && getAllSelectedMedias().size > 0) deselectAllMedias();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ isHome?: boolean | undefined }>;
