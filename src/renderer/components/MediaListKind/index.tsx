import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { CtxContentEnum, ContextMenu } from "@components/ContextMenu";
import { assertUnreachable, time } from "@utils/utils";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { resetAllAppData } from "@utils/app";
import {
	deselectAllMedias,
	allSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";
import {
	type MainList,
	type History,
	usePlaylists,
	PlaylistList,
	mainList,
} from "@contexts/usePlaylists";
import {
	computeHistoryItemKey,
	selectMediaByEvent,
	computeItemKey,
	reloadWindow,
	itemContent,
	useFromList,
} from "./helper";

import { ListWrapper, EmptyList, Footer } from "./styles";
import { ErrorFallback } from "../ErrorFallback";

/////////////////////////////////////////

// href="https://www.flaticon.com/free-icons/error" =>
const noMediaFoundPng = new URL("../../assets/not-found.png", import.meta.url);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const MediaListKind = ({ isHome }: Props) => (
	<ErrorBoundary
		FallbackComponent={() => (
			<ErrorFallback description="Rendering the list threw an error. This is probably a bug. Try	closing and opening the app, if the error persists, click on the button below." />
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
	const [isCtxMenuOpen, setIsCtxMenuOpen] = useState(false);
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
					case PlaylistList.MAIN_LIST:
						return Array.from(
							list as MainList,
							([path, media]) => [path, media, 0],
						);

					case PlaylistList.SORTED_BY_DATE:
					case PlaylistList.FAVORITES: {
						const mainList_ = mainList();

						const listAsArrayOfAMap: [Path, Media, DateAsNumber][] = [];

						(list as Set<Path>).forEach(path => {
							const media = mainList_.get(path);

							media && listAsArrayOfAMap.push([path, media, 0]);
						});

						return listAsArrayOfAMap;
					}

					case PlaylistList.HISTORY: {
						const unsortedList: [Path, DateAsNumber][] = [];

						(list as History).forEach((dates, path) =>
							dates.forEach(date => unsortedList.push([path, date]))
						);

						const mainList_ = mainList();

						const listAsArrayOfMap = unsortedList
							.sort((a, b) => a[1] - b[1]) // sorted by date
							.map(([path, date]) => [path, mainList_.get(path), date]) as [
								Path,
								Media,
								DateAsNumber,
							][];

						return listAsArrayOfMap;
					}

					default:
						return assertUnreachable(listName);
				}
			}, "listAsArrayOfAMap"),
		[listName, list],
	);

	useOnClickOutside(
		listRef,
		() => handleDeselectAllMedias(listRef, isCtxMenuOpen),
	);

	useEffect(() => {
		useFromList.setState({ isHome });
	}, [isHome]);

	useEffect(() => {
		function selectAllMediasOnCtrlPlusA(e: KeyboardEvent) {
			if (
				e.ctrlKey && e.key === "a" && !isAModifierKeyPressed(e, ["Control"])
			) {
				e.preventDefault();
				selectAllMedias();
			}
		}

		document.addEventListener("keydown", selectAllMediasOnCtrlPlusA);

		return () =>
			document.removeEventListener("keydown", selectAllMediasOnCtrlPlusA);
	}, []);

	return (
		<ListWrapper ref={listRef}>
			<ContextMenu
				content={CtxContentEnum.MEDIA_OPTIONS}
				onContextMenu={selectMediaByEvent}
				setIsOpen={setIsCtxMenuOpen}
			>
				<Virtuoso
					components={{
						EmptyPlaceholder: () => (
							<EmptyList>
								<img src={noMediaFoundPng.href} alt="No medias found." />
								No medias found
							</EmptyList>
						),
						Header: () => <Footer />,
						Footer: () => <Footer />,
					}}
					computeItemKey={listName === PlaylistList.HISTORY ?
						computeHistoryItemKey :
						computeItemKey}
					totalCount={listAsArrayOfAMap.length}
					itemContent={itemContent}
					data={listAsArrayOfAMap}
					fixedItemHeight={65}
					className="list"
					overscan={10}
					noValidate
				/>
			</ContextMenu>
		</ListWrapper>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function handleDeselectAllMedias(
	listRef: Readonly<React.RefObject<HTMLDivElement>>,
	isCtxMenuOpen: Readonly<boolean>,
) {
	if (
		listRef.current !== null && isCtxMenuOpen === false &&
		allSelectedMedias().size > 0
	)
		deselectAllMedias();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ isHome?: boolean; }>;
