import { useEffect, useRef } from "react";

import { ContextMenu, CtxContentEnum } from "../ContextMenu";
import { selectMediaByPointerEvent } from "../MediaListKind/helper";
import { MediaSearchRow } from "./MediaSearchRow";
import { useTranslation } from "@i18n";
import { RightSlot } from "../RightSlot";
import { BaseInput } from "../BaseInput";
import { Popover } from "../Popover";
import {
	setDefaultSearch,
	setSearchTerm,
	SearchStatus,
	useSearcher,
} from "./state";
import { on } from "@utils/window";

export function SearchMedia() {
	const { searchStatus, results, searchTerm, highlight } = useSearcher();
	const searchWrapperRef = useRef<HTMLDivElement>(null);
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
	// onPointerDownOutside = { setDefaultSearch };
	/////////////////////////////////////////

	useEffect(() => {}, []);

	return (
		<div ref={searchWrapperRef}>
			<BaseInput
				RightSlot={<RightSlot id="searcher-right-slot">Alt+s</RightSlot>}
				label={t("labels.searchForSongs")}
				onEscape={setDefaultSearch}
				onChange={setSearchTerm}
				value={searchTerm}
				spellCheck="false"
				autoCorrect="off"
				accessKey="s"
			/>

			{shouldPopoverOpen ? (
				<ContextMenu
					content={CtxContentEnum.SEARCH_MEDIA_OPTIONS}
					onContextMenu={selectMediaByPointerEvent}
					isAllDisabled={foundSomething}
				>
					<Popover
						size={
							nothingFound
								? "nothing-found-for-search-media"
								: "search-media-results"
						}
						onPointerDownOutside={setDefaultSearch}
						onEscape={setDefaultSearch}
						isOpen
					>
						{nothingFound ? (
							<div className="nothing-found">
								Nothing was found for &quot;{searchTerm}&quot;
							</div>
						) : (
							// foundSomething:
							resultsJSXs
						)}
					</Popover>
				</ContextMenu>
			) : null}
		</div>
	);
}
