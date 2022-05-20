import type { Media, Path } from "@common/@types/generalTypes";

import { useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { resetAllAppData } from "@utils/app";
import { time } from "@utils/utils";
import {
	useFromList as fromListToSet,
	computeItemKey,
	itemContent,
} from "./helper";
import {
	usePlaylists,
	PlaylistList,
	getPlaylist,
} from "@contexts/mediaHandler/usePlaylists";

import {
	ResetAllAppDataButton,
	ListWrapper,
	EmptyList,
	SubTitle,
	Footer,
	Title,
	Alert,
	Msg,
} from "./styles";

// href="https://www.flaticon.com/free-icons/error" =>
const noMediaFoundPng = new URL("../../assets/not-found.png", import.meta.url);

export const MediaListKind = ({ fromList }: MediaListKindProps) => (
	<ErrorBoundary
		FallbackComponent={ErrorFallback}
		onReset={() => {
			// TODO: reset the state of your app so the error doesn't happen again
			console.error(
				"This should reset all app data, but it does nothing at the moment"
			);
		}}
	>
		<MediaListKind_ fromList={fromList} />
	</ErrorBoundary>
);

function MediaListKind_({ fromList }: MediaListKindProps) {
	const { mainList, favorites, history, sortedByDate, sortedByName } =
		usePlaylists();

	useEffect(() => {
		fromListToSet.setState({ fromList });
	}, [fromList]);

	const listAsArrayOfAMap: [Path, Media][] = useMemo(
		() =>
			time(() => {
				const list = getPlaylist(fromList);

				if (Array.isArray(list)) {
					const listAsArrayOfAMap = [];
					mainList.forEach((media, path) => {
						if (list.includes(path)) listAsArrayOfAMap.push([path, media]);
					});
				} else if (list instanceof Set) {
					const listAsArrayOfAMap = [];
					mainList.forEach((media, path) => {
						if (list.has(path)) listAsArrayOfAMap.push([path, media]);
					});
				} else if (list instanceof Map) {
					const listAsArrayOfAMap = [];
					mainList.forEach((media, path) => {
						if (list.has(path)) listAsArrayOfAMap.push([path, media]);
					});
				}

				throw new Error("The list is not an array, a set or a map");
			}, "listAsArrayOfAMap"),
		// Disable cause we need to listen to all the lists cause
		// we don't know wich one it is
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[mainList, favorites, history, sortedByDate, sortedByName, fromList]
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

function ErrorFallback({ error }: ErrorBoundaryProps) {
	return (
		<Alert role="alert">
			<Title>Something went wrong:</Title>
			<SubTitle>
				Try closing and opening the app, if the error persists, click on the
				button below!
			</SubTitle>

			<Msg>{error.message}</Msg>

			<ResetAllAppDataButton onClick={resetAllAppData}>
				Reset all app data!
			</ResetAllAppDataButton>
		</Alert>
	);
}

type ErrorBoundaryProps = Readonly<{
	error: Error;
}>;

export type MediaListKindProps = Readonly<{
	fromList: PlaylistList;
}>;
