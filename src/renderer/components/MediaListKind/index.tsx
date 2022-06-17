import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { ContentEnum, ContextMenu } from "@components/ContextMenu";
import { assertUnreachable, time } from "@utils/utils";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { resetAllAppData } from "@utils/app";
import { emptySet } from "@utils/map-set";
import {
	type MainList,
	type History,
	usePlaylists,
	PlaylistList,
	mainList,
} from "@contexts/mediaHandler/usePlaylists";
import {
	getAllSelectedMedias,
	setAllSelectedMedias,
	selectMediaOrMedias,
	computeHistoryKey,
	computeItemKey,
	reloadWindow,
	itemContent,
	useFromList,
} from "./helper";

import { ListWrapper, EmptyList, Footer } from "./styles";
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
	const [isCtxMenuOpen, setIsCtxMenuOpen] = useState(false);
	const { fromList, homeList } = useFromList();
	const listRef = useRef<HTMLDivElement>(null);

	// isHome is used to determine which list to use
	// when the user is at the home page, the homeList is used
	// then, cause it will have what the user has last set as the main list:
	// either sortedByDate or sortedByName, in our current case.
	const listName = isHome ? homeList : fromList;
	const { [listName]: list } = usePlaylists();

	const listAsArrayOfAMap: [Path, Media][] = useMemo(() =>
		time(() => {
			switch (listName) {
				case PlaylistList.MAIN_LIST:
					return [...(list as MainList)];

				case PlaylistList.SORTED_BY_DATE:
				case PlaylistList.FAVORITES: {
					const mainList_ = mainList();

					const listAsArrayOfAMap: [Path, Media][] = [];

					(list as Set<Path>).forEach(path => {
						const media = mainList_.get(path);

						media && listAsArrayOfAMap.push([path, media]);
					});

					return listAsArrayOfAMap;
				}

				case PlaylistList.HISTORY: {
					const unsortedList: [Path, DateAsNumber][] = [];

					(list as History).forEach((dates, path) =>
						dates.forEach(date => unsortedList.push([path, date]))
					);

					const sortedByDate = unsortedList.sort((a, b) => a[1] - b[1]);

					const mainList_ = mainList();

					const listAsArrayOfMap = sortedByDate.map(([path]) => {
						const media = mainList_.get(path);

						if (!media)
							return console.error(`Media not found for path: ${path}`);

						return [path, media];
					}).filter(Boolean) as [Path, Media][];

					return listAsArrayOfMap;
				}

				default:
					return assertUnreachable(listName);
			}
		}, "listAsArrayOfAMap"), [listName, list]);

	useOnClickOutside(listRef, () => deselectAllMedias(listRef, isCtxMenuOpen));

	useEffect(() => {
		useFromList.setState({ isHome });
	}, [isHome]);

	return (
		<ListWrapper ref={listRef}>
			<ContextMenu
				content={ContentEnum.MEDIA_OPTIONS}
				onContextMenu={selectMediaOrMedias}
				setIsOpen={setIsCtxMenuOpen}
			>
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
					computeItemKey={listName === PlaylistList.HISTORY ?
						computeHistoryKey :
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

function deselectAllMedias(
	listRef: React.RefObject<HTMLDivElement>,
	isCtxMenuOpen: boolean,
) {
	const { allSelectedMedias } = getAllSelectedMedias();

	if (allSelectedMedias.size > 0 && listRef.current && !isCtxMenuOpen)
		setAllSelectedMedias({ allSelectedMedias: emptySet });
}

type Props = { isHome?: boolean; };
