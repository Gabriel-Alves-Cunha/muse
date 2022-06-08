import type { Media, Path } from "@common/@types/generalTypes";

import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { assertUnreachable, time } from "@utils/utils";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { resetAllAppData } from "@utils/app";
import { dbg } from "@common/utils";
import {
	usePlaylists,
	PlaylistList,
	getPlaylist,
	MainList,
	History,
} from "@contexts/mediaHandler/usePlaylists";
import {
	allSelectedMedias,
	computeItemKey,
	reloadWindow,
	itemContent,
	useFromList,
} from "./helper";

import { ListWrapper, EmptyList, Footer, RowWrapper } from "./styles";
import { ErrorFallback } from "../ErrorFallback";

// href="https://www.flaticon.com/free-icons/error" =>
const noMediaFoundPng = new URL("../../assets/not-found.png", import.meta.url);

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
		<MediaListKind_ isHome={isHome} />
	</ErrorBoundary>
);

function MediaListKind_({ isHome = false }: Props) {
	const { fromList, homeList } = useFromList();
	const listRef = useRef<HTMLDivElement>(null);

	// isHome is used to determine which list to use
	// when the user is at the home page, the homeList is used
	// then, cause it will have what the user has last set as the main list:
	// either sortedByDate or sortedByName, in our current case.
	const listName = isHome ? homeList : fromList;
	const { [listName]: list } = usePlaylists();

	const listAsArrayOfAMap: [Path, Media][] = useMemo(
		() =>
			time(() => {
				switch (listName) {
					case PlaylistList.MAIN_LIST:
						return [...(list as MainList)];

					case PlaylistList.SORTED_BY_DATE:
					case PlaylistList.FAVORITES: {
						const mainList = getPlaylist(PlaylistList.MAIN_LIST) as MainList;

						const listAsArrayOfAMap: [Path, Media][] = [];

						(list as Set<Path>).forEach(path => {
							const media = mainList.get(path);

							media && listAsArrayOfAMap.push([path, media]);
						});

						return listAsArrayOfAMap;
					}

					case PlaylistList.HISTORY: {
						const mainList = getPlaylist(PlaylistList.MAIN_LIST) as MainList;

						const listAsArrayOfAMap: [Path, Media][] = [];

						if (fromList === PlaylistList.HISTORY) {
							(list as History).forEach((_, path) => {
								// TODO: handle how to show history items:
								const media = mainList.get(path);

								media && listAsArrayOfAMap.push([path, media]);
							});
						}

						return listAsArrayOfAMap;
					}

					default:
						return assertUnreachable(listName);
				}
			}, "listAsArrayOfAMap"),
		[listName, list, fromList],
	);

	useOnClickOutside(
		listRef,
		// Deselect all medias:
		() => {
			dbg("useOnClickOutside");
			if (allSelectedMedias.size > 0 && listRef.current) {
				// mediaRowRef.current?.classList.remove("selected");
				document
					.querySelectorAll(`.${RowWrapper.className}`)
					.forEach(item => item.classList.remove("selected"));
				allSelectedMedias.clear();
			}
		},
	);

	useEffect(() => {
		useFromList.setState({ isHome });
	}, [isHome]);

	return (
		<ListWrapper ref={listRef}>
			<Virtuoso
				components={{
					EmptyPlaceholder: () => (
						<EmptyList>
							<img src={noMediaFoundPng.href} alt="No medias found" />
							No medias found
						</EmptyList>
					),
					Header: () => <Footer />,
					Footer: () => <Footer />,
				}}
				computeItemKey={computeItemKey}
				itemContent={itemContent}
				data={listAsArrayOfAMap}
				fixedItemHeight={65}
				className="list"
				overscan={10}
				noValidate
			/>
		</ListWrapper>
	);
}

type Props = {
	isHome?: boolean;
};
