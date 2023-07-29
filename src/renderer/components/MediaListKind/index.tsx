import type { Media, Path } from "@common/@types/GeneralTypes";

import { MdSearchOff as NoMediaFound } from "react-icons/md";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Virtuoso } from "react-virtuoso";

import { CtxContentEnum, ContextMenu } from "../ContextMenu";
import { ItemContent, LEFT_CLICK } from "./Row";
import { useListTypeToDisplay } from "./states";
import { PlaylistListEnum } from "@common/enums";
import { error, throwErr } from "@common/log";
import { resetAllAppData } from "@utils/app";
import { ErrorFallback } from "../ErrorFallback";
import { usePlaylists } from "@contexts/playlists";
import { on, removeOn } from "@utils/window";
import { time } from "@utils/utils";
import { t } from "@i18n";
import {
	clearAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/allSelectedMedias";
import {
	selectAllMediasOnCtrlPlusA,
	computeHistoryItemKey,
	computeItemKey,
	reloadWindow,
} from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Wrapping main function in an error boundary:

const onReset = (): void => {
	resetAllAppData();
	reloadWindow();
};

const FallbackComponent = (): JSX.Element => (
	<ErrorFallback
		description={t("errors.mediaListKind.errorFallbackDescription")}
	/>
);

export const MediaListKind = (props: Props): JSX.Element => (
	<ErrorBoundary FallbackComponent={FallbackComponent} onReset={onReset}>
		<MediaListKindWithoutErrorBoundary {...props} />
	</ErrorBoundary>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

function MediaListKindWithoutErrorBoundary({ isHome }: Props): JSX.Element {
	const listTypeToDisplay = useListTypeToDisplay();
	const wrapperRef = useRef<HTMLDivElement>(null);
	const playlists = usePlaylists();

	const listName = isHome
		? listTypeToDisplay.homeListToDisplay
		: listTypeToDisplay.current;

	const list = playlists[listName];

	const listAsArrayOfAMap: readonly [Path, Media][] = useMemo(
		() =>
			time(() => {
				const mainList = playlists.sortedByTitleAndMainList;

				if (listName === PlaylistListEnum.mainList) return [...mainList];

				if (
					listName === PlaylistListEnum.sortedByDate ||
					listName === PlaylistListEnum.favorites
				) {
					const listAsArrayOfAMap: [Path, Media][] = [];

					for (const path of list as ReadonlySet<Path>) {
						const media = mainList.get(path);

						if (!media) {
							setTimeout(() => {
								error(`"${path}" not found at \`listAsArrayOfAMap\`!`);
							}, 1_000);

							continue;
						}

						listAsArrayOfAMap.push([path, media]);
					}

					return listAsArrayOfAMap;
				}

				if (listName === PlaylistListEnum.history) {
					const listAsArrayOfAMap = [...mainList].sort((a, b) => {
						if (a[1].lastPlayedAt < b[1].lastPlayedAt) return -1;
						if (a[1].lastPlayedAt > b[1].lastPlayedAt) return 1;
						return 0;
					});

					return listAsArrayOfAMap;
				}

				throwErr(`"${listName}" not found!`);
			}, "listAsArrayOfAMap"),
		[list, listName, playlists.sortedByTitleAndMainList],
	);

	useEffect(() => {
		function handleDeselectAllMedias(event: PointerEvent): void {
			if (getAllSelectedMedias().size === 0) return;

			const isClickInside = wrapperRef.current?.contains(event.target as Node);
			const shouldIgnoreBecauseItIsLeftClick = event.button !== LEFT_CLICK;

			if (shouldIgnoreBecauseItIsLeftClick || isClickInside) return;

			clearAllSelectedMedias();
		}

		on("pointerup", handleDeselectAllMedias);
		on("keydown", selectAllMediasOnCtrlPlusA);

		return () => {
			removeOn("pointerup", handleDeselectAllMedias);
			removeOn("keydown", selectAllMediasOnCtrlPlusA);
		};
	}, []);

	return (
		// For some reason (className at wrapperProps) 87% is the spot that makes the header above it have it's target size (h-14 === 3.5rem)
		<ContextMenu
			wrapperProps={{ className: "max-w-2xl h-[87%]", ref: wrapperRef }}
			content={CtxContentEnum.MEDIA_OPTIONS}
		>
			<Virtuoso
				computeItemKey={
					listName === PlaylistListEnum.history
						? computeHistoryItemKey
						: computeItemKey
				}
				totalCount={listAsArrayOfAMap.length}
				itemContent={ItemContent}
				data={listAsArrayOfAMap}
				components={components}
				fixedItemHeight={64}
				className="list"
				overscan={15}
				noValidate
				id="list"
			/>
		</ContextMenu>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const footer = <div className="relative w-2 h-2 bg-none" />;

const Footer = (): JSX.Element => footer;

const emptyPlaceholder = (
	<div className="empty-placeholder">
		<NoMediaFound className="w-14 h-14 mr-5" />

		{t("alts.noMediasFound")}
	</div>
);

const EmptyPlaceholder = (): JSX.Element => emptyPlaceholder;

const components = { EmptyPlaceholder, Header: Footer, Footer };

type Props = Readonly<{ isHome?: boolean }>;
