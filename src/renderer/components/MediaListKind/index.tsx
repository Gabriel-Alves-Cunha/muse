import { useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { resetAllAppData } from "@utils/app";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import {
	playlistName as playlistNameToSet,
	computeItemKey,
	itemContent,
} from "./helper";
import {
	type Playlist,
	usePlaylists,
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

export const MediaListKind = ({ playlistName }: MediaListKindProps) => (
	<ErrorBoundary
		FallbackComponent={ErrorFallback}
		onReset={() => {
			// TODO: reset the state of your app so the error doesn't happen again
			console.error(
				"This should reset all app data, but it does nothing at the moment"
			);
		}}
	>
		<MediaListKind_ playlistName={playlistName} />
	</ErrorBoundary>
);

function MediaListKind_({ playlistName }: MediaListKindProps) {
	const { playlists, mainList } = usePlaylists();

	useEffect(() => {
		playlistNameToSet.setState({ playlistName });
	}, [playlistName]);

	const list = useMemo(() => {
		// Handle when playlistName === MAIN_LIST:
		const start = performance.now();

		const data =
			playlistName === MAIN_LIST
				? mainList
				: // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				  playlists
						.find(p => p.name === playlistName)!
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						.list.map(mediaID => mainList.find(m => m.id === mediaID)!);

		const end = performance.now();
		console.log(
			`%cLoop to find all medias by id took: ${end - start} ms.`,
			"color:brown"
		);

		return data;
	}, [mainList, playlistName, playlists]);

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
				totalCount={list.length}
				fixedItemHeight={65}
				className="list"
				overscan={10}
				data={list}
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
	playlistName: Playlist["name"];
}>;
