import { ContextMenu, CtxContentEnum } from "../ContextMenu";
import { PopoverContent, PopoverRoot } from "../Popover";
import { selectMediaByPointerEvent } from "../MediaListKind/helper";
import { MediaSearchRow } from "./MediaSearchRow";
import { useTranslation } from "@i18n";
import { RightSlot } from "../ContextMenu/RightSlot";
import { BaseInput } from "../BaseInput";
import {
	setDefaultSearch,
	setSearchTerm,
	SearchStatus,
	useSearcher,
} from "./state";

const mantainFocusOnInput = (e: Event) => e.preventDefault();

export function SearchMedia() {
	const { searchStatus, results, searchTerm, highlight } = useSearcher();
	const { t } = useTranslation();

	const resultsJSXs: JSX.Element[] = [];

	/////////////////////////////////////////

	const foundSomething = searchStatus === SearchStatus.FOUND_SOMETHING;
	const nothingFound = searchStatus === SearchStatus.NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething || nothingFound;

	/////////////////////////////////////////

	for (const [id, media] of results)
		resultsJSXs.push(
			<MediaSearchRow highlight={highlight} media={media} key={id} id={id} />,
		);

	return (
		<>
			<BaseInput
				RightSlot={<RightSlot id="search">Alt+s</RightSlot>}
				label={t("labels.searchForSongs")}
				onChange={setSearchTerm}
				value={searchTerm}
				spellCheck="false"
				autoCorrect="off"
				id="search-songs"
				accessKey="s"
			/>

			<ContextMenu
				content={CtxContentEnum.SEARCH_MEDIA_OPTIONS}
				onContextMenu={selectMediaByPointerEvent}
				isAllDisabled={nothingFound}
			>
				<PopoverRoot open={shouldPopoverOpen}>
					<PopoverContent
						size={
							nothingFound
								? "nothing-found-for-search-media"
								: "search-media-results"
						}
						onPointerDownOutside={setDefaultSearch}
						onOpenAutoFocus={mantainFocusOnInput}
						className="transition-none"
					>
						{nothingFound ? (
							<div className="nothing-found">
								Nothing was found for &quot;{searchTerm}&quot;
							</div>
						) : foundSomething ? (
							resultsJSXs
						) : null}
					</PopoverContent>
				</PopoverRoot>
			</ContextMenu>
		</>
	);
}
