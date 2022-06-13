import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { assertUnreachable, time } from "@utils/utils";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { resetAllAppData } from "@utils/app";
import {
	type MainList,
	type History,
	usePlaylists,
	PlaylistList,
	mainList,
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
						if (!media) return;

						return [path, media];
					}).filter(Boolean) as [Path, Media][];

					/////////////////////////////////////////////
					/////////////////////////////////////////////

					if (import.meta.vitest) {
						(async () => {
							// @ts-ignore => these do exist, don't know why ts complains
							const { it, expect } = import.meta.vitest;

							const { getRandomInt } = await import("@utils/utils");
							const { playThisMedia, currentPlaying } = await import(
								"@contexts/mediaHandler/useCurrentPlaying"
							);
							const { testArray, numberOfMedias } = await import(
								"__tests__/unit/renderer/src/contexts/mediaHandler/fakeTestList"
							);

							it("is testing the above function execution (history list display)", () => {
								const timesAllMediasWerePlayed = 100; // arbitrary number to make the medias repeat

								{ // first create a history by playing random medias in the main list several times:
									for (let i = 0; i < timesAllMediasWerePlayed; ++i) {
										const randomMediaPath =
											// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
											testArray[getRandomInt(0, numberOfMedias)]![0];
										expect(randomMediaPath).toBeTruthy();

										playThisMedia(randomMediaPath, PlaylistList.MAIN_LIST);
										expect(currentPlaying().path).toBe(randomMediaPath);
									}
								}

								const unsortedList: [Path, DateAsNumber][] = [];

								(list as History).forEach((dates, path) =>
									dates.forEach(date => unsortedList.push([path, date]))
								);

								const sortedByDate = unsortedList.sort((a, b) => a[1] - b[1]);

								const mainList_ = mainList();

								const listAsArrayOfMap = sortedByDate.map(([path]) => {
									const media = mainList_.get(path);
									if (!media) return;

									return [path, media];
								}).filter(Boolean) as [Path, Media][];

								{
									// console.log("history:", history());
									console.log("list =", unsortedList, unsortedList.length);
									console.log(
										"sortedByDate =",
										sortedByDate,
										sortedByDate.length,
									);
									console.log(
										"listAsArrayOfMap =",
										listAsArrayOfMap,
										listAsArrayOfMap.length,
									);

									expect(listAsArrayOfMap.length).toBe(
										timesAllMediasWerePlayed,
									);
								}
							});
						})();
					}

					/////////////////////////////////////////////
					/////////////////////////////////////////////

					return listAsArrayOfMap;
				}

				default:
					return assertUnreachable(listName);
			}
		}, "listAsArrayOfAMap"), [listName, list]);

	useOnClickOutside(
		listRef,
		// Deselect all medias:
		() => {
			if (allSelectedMedias.size > 0 && listRef.current) {
				document.querySelectorAll(`.${RowWrapper.className}`).forEach(item =>
					item.classList.remove("selected")
				);
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

type Props = { isHome?: boolean; };
