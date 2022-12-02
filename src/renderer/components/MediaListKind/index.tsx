import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { useI18n } from "@solid-primitives/i18n";
import {
	type Component,
	ErrorBoundary,
	createEffect,
	createMemo,
	onCleanup,
	onMount,
} from "solid-js";

import { SearchOffIcon as NoMediaFound } from "@icons/SearchOffIcon";
import { ctxContentEnum, ContextMenu } from "@components/ContextMenu";
import { assertUnreachable, time } from "@utils/utils";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { ErrorFallback } from "../ErrorFallback";
import { playlistList } from "@common/enums";
import { error } from "@utils/log";
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
	itemContent,
	useFromList,
} from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const MediaListKind: Component<Props> = (props) => {
	const [t] = useI18n();

	return (
		<ErrorBoundary
			fallback={(err) => {
				error(err);

				return (
					<ErrorFallback
						description={t("errors.mediaListKind.errorFallbackDescription")}
					/>
				);
			}}
		>
			<MediaListKindWithoutErrorBoundary isHome={props.isHome} />
		</ErrorBoundary>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const MediaListKindWithoutErrorBoundary: Component<Props> = (props) => {
	const { fromList, homeList } = useFromList();
	let listRef: HTMLDivElement | undefined;

	// isHome is used to determine which list to use
	// when the user is at the home page, the homeList is used
	// then, cause it will have what the user has last set as the main list:
	// either sortedByDate or sortedByName, in our current case.
	const listName = () => (props.isHome === true ? homeList : fromList);
	const { [listName()]: list } = usePlaylists();

	// readonly [Path, Media, DateAsNumber][]
	const listAsArrayOfAMap = createMemo(() =>
		time(() => {
			const name = listName();

			switch (name) {
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
					return assertUnreachable(name);
			}
		}, "listAsArrayOfAMap"),
	);

	onMount(() => {
		useOnClickOutside(listRef as HTMLDivElement, handleDeselectAllMedias);
	});

	createEffect(() => useFromList.setState({ isHome: Boolean(props.isHome) }));

	document.addEventListener("keydown", selectAllMediasOnCtrlPlusA);

	onCleanup(() =>
		document.removeEventListener("keydown", selectAllMediasOnCtrlPlusA),
	);

	return (
		// For some reason (CSS) 87% is the spot that makes the header above it have it's target size (h-14 === 3.5rem)
		<div class="max-w-2xl h-[87%]" ref={listRef as HTMLDivElement}>
			<ContextMenu
				onContextMenu={selectMediaByPointerEvent}
				content={ctxContentEnum.MEDIA_OPTIONS}
				setIsOpen={setIsCtxMenuOpen}
			>
				<Virtuoso
					computeItemKey={
						listName() === playlistList.history
							? computeHistoryItemKey
							: computeItemKey
					}
					totalCount={listAsArrayOfAMap.length}
					itemContent={itemContent}
					data={listAsArrayOfAMap}
					components={components}
					fixedItemHeight={65}
					class="list"
					overscan={15}
					noValidate
				/>
			</ContextMenu>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const Footer: Component = () => <div class="relative w-2 h-2 bg-none" />;

const EmptyPlaceholder: Component = () => {
	const [t] = useI18n();

	return (
		<div class="absolute flex justify-center items-center center text-alternative font-secondary tracking-wider text-lg font-medium">
			<NoMediaFound class="w-14 h-14 mr-5" />

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

type Props = { isHome?: boolean | undefined };
