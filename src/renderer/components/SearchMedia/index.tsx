import { useRef } from "react";

import { ContextMenu, CtxContentEnum } from "../ContextMenu";
import { selectMediaByPointerEvent } from "../MediaListKind/helper";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { MediaSearchRow } from "./MediaSearchRow";
import { PopoverContent } from "../Popover";
import { useTranslation } from "@i18n";
import { RightSlot } from "../ContextMenu/RightSlot";
import { BaseInput } from "../BaseInput";
import {
	setDefaultSearch,
	setSearchTerm,
	SearchStatus,
	useSearcher,
} from "./state";

export function SearchMedia() {
	const { searchStatus, results, searchTerm, highlight } = useSearcher();
	const searchWrapper = useRef<HTMLDivElement>(null);
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

	/////////////////////////////////////////

	useOnClickOutside(searchWrapper, setDefaultSearch);

	return (
		<div ref={searchWrapper}>
			<BaseInput
				RightSlot={<RightSlot id="searcher-right-slot">Alt+s</RightSlot>}
				label={t("labels.searchForSongs")}
				onEscape={setDefaultSearch}
				onChange={setSearchTerm}
				value={searchTerm}
				spellCheck="false"
				autoCorrect="off"
				id="search-songs"
				accessKey="s"
			/>

			{shouldPopoverOpen ? (
				<ContextMenu
					content={CtxContentEnum.SEARCH_MEDIA_OPTIONS}
					onContextMenu={selectMediaByPointerEvent}
					isAllDisabled={foundSomething}
				>
					<PopoverContent
						size={
							nothingFound
								? "nothing-found-for-search-media"
								: "search-media-results"
						}
						onPointerDownOutside={setDefaultSearch}
						className="transition-none visible"
						htmlFor=""
					>
						{nothingFound ? (
							<div className="nothing-found">
								Nothing was found for &quot;{searchTerm}&quot;
							</div>
						) : (
							// foundSomething:
							resultsJSXs
						)}
					</PopoverContent>
				</ContextMenu>
			) : null}
		</div>
	);
}
