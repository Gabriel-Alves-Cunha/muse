import type { Media, Path } from "@common/@types/generalTypes";

import { useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";
import { Dialog } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { time } from "@utils/utils";
import {
	computeItemKey,
	reloadWindow,
	itemContent,
	useFromList,
} from "./helper";
import {
	usePlaylists,
	PlaylistList,
	getPlaylist,
} from "@contexts/mediaHandler/usePlaylists";

import {
	ListWrapper,
	EmptyList,
	ErrorMsg,
	SubTitle,
	Footer,
	Center,
} from "./styles";
import {
	ButtonToClose,
	StyledContent,
	StyledOverlay,
	StyledTitle,
} from "./MediaOptions/styles";

// href="https://www.flaticon.com/free-icons/error" =>
const noMediaFoundPng = new URL("../../assets/not-found.png", import.meta.url);

export const MediaListKind = ({ fromList }: MediaListKindProps) => (
	<ErrorBoundary
		FallbackComponent={ErrorFallback}
		onReset={() => {
			resetAllAppData();
			reloadWindow();
		}}
	>
		<MediaListKind_ fromList={fromList} />
	</ErrorBoundary>
);

function MediaListKind_({ fromList }: MediaListKindProps) {
	const { mainList, favorites, history, sortedByDate, sortedByName } =
		usePlaylists();

	useEffect(() => {
		useFromList.setState({ fromList });
	}, [fromList]);

	const listAsArrayOfAMap: [Path, Media][] = useMemo(
		() =>
			time(() => {
				const list = getPlaylist(fromList);

				if (Array.isArray(list)) {
					const listAsArrayOfAMap: [Path, Media][] = [];
					mainList.forEach((media, path) => {
						if (list.includes(path)) listAsArrayOfAMap.push([path, media]);
					});
					return listAsArrayOfAMap;
				} else if (list instanceof Set) {
					const listAsArrayOfAMap: [Path, Media][] = [];
					mainList.forEach((media, path) => {
						if (list.has(path)) listAsArrayOfAMap.push([path, media]);
					});
					return listAsArrayOfAMap;
				} else if (list instanceof Map) {
					// Since the only list that is a Map is the
					// mainList, we can take a shortcut:
					return Array.from(mainList);
				}

				throw new Error("The list is not an Array, a Set or a Map!");
			}, "listAsArrayOfAMap"),
		// Disable cause we need to listen to all the lists cause
		// we don't know wich one it is
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[mainList, favorites, history, sortedByDate, sortedByName, fromList],
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
		<Dialog modal open>
			<StyledOverlay />

			<StyledContent>
				<Center>
					<StyledTitle>Something went wrong</StyledTitle>
					<SubTitle>
						Rendering the list threw an error. This is probably a bug. Try
						closing and opening the app, if the error persists, click on the
						button below.
					</SubTitle>

					<ErrorMsg>{error.message}</ErrorMsg>

					<ButtonToClose
						onClick={() => {
							resetAllAppData();
							reloadWindow();
						}}
						id="reset-app-data"
					>
						Reset all app data
					</ButtonToClose>

					<ButtonToClose id="reload-window" onClick={reloadWindow}>
						Reload window
					</ButtonToClose>
				</Center>
			</StyledContent>
		</Dialog>
	);
}

type ErrorBoundaryProps = Readonly<{
	error: Error;
}>;

export type MediaListKindProps = Readonly<{
	fromList: PlaylistList;
}>;
