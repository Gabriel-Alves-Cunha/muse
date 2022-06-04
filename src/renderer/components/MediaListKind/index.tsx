import type { Media, Path } from "@common/@types/generalTypes";

import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";
import { useMemo } from "react";

import { usePlaylists, getPlaylist } from "@contexts/mediaHandler/usePlaylists";
import { resetAllAppData } from "@utils/app";
import { time } from "@utils/utils";
import {
	computeItemKey,
	reloadWindow,
	itemContent,
	useFromList,
} from "./helper";

import { ListWrapper, EmptyList, Footer } from "./styles";
import { ErrorFallback } from "@components/ErrorFallback";

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
	const {
		sortedByName: mainList,
		sortedByDate,
		favorites,
		history,
	} = usePlaylists();

	const listAsArrayOfAMap: [Path, Media][] = useMemo(
		() =>
			time(() => {
				const list = getPlaylist(isHome ? homeList : fromList);

				// Since the ONLY list that is a Map is
				// the mainList, we can take a shortcut:
				if (list instanceof Map) return [...mainList];

				const listAsArrayOfAMap: [Path, Media][] = [];

				list.forEach(path => {
					const media = mainList.get(path);

					media && listAsArrayOfAMap.push([path, media]);
				});

				return listAsArrayOfAMap;
			}, "listAsArrayOfAMap"),
		// Disable cause we need to listen to all the lists cause
		// we don't know wich one it is; wish I'd find a better
		// way to make it dynamic...
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[mainList, favorites, history, sortedByDate, fromList, isHome, homeList],
	);

	return (
		<ListWrapper>
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
