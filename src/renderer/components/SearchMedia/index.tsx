import { useSnapshot } from "valtio";
import { useRef } from "react";

import { ContextMenu, CtxContentEnum } from "../ContextMenu";
import { selectMediaByPointerEvent } from "../MediaListKind/helper";
import { MediaSearchRow } from "./MediaSearchRow";
import { translation } from "@i18n";
import { RightSlot } from "../RightSlot";
import { BaseInput } from "../BaseInput";
import { Popover } from "../Popover";
import {
	setDefaultSearch,
	setSearchTerm,
	SearchStatus,
	searcher,
} from "./state";

export function SearchMedia() {
	// By default, state mutations are batched before triggering re-render.
	// Sometimes, we want to disable the batching. The known use case of this is input.
	const searcherAccessor = useSnapshot(searcher, { sync: true });
	const searchWrapperRef = useRef<HTMLDivElement>(null);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	const resultsJSXs: JSX.Element[] = [];

	/////////////////////////////////////////

	const foundSomething =
		searcherAccessor.searchStatus === SearchStatus.FOUND_SOMETHING;
	const nothingFound =
		searcherAccessor.searchStatus === SearchStatus.NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething || nothingFound;

	/////////////////////////////////////////

	for (const [path, media] of searcherAccessor.results)
		resultsJSXs.push(
			<MediaSearchRow
				highlight={searcherAccessor.highlight}
				media={media}
				path={path}
				key={path}
			/>,
		);

	/////////////////////////////////////////

	return (
		<div ref={searchWrapperRef}>
			<BaseInput
				RightSlot={<RightSlot id="searcher-right-slot">Alt+s</RightSlot>}
				value={searcherAccessor.searchTerm}
				label={t("labels.searchForSongs")}
				onEscape={setDefaultSearch}
				onChange={setSearchTerm}
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
								Nothing was found for &quot;{searcherAccessor.searchTerm}&quot;
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
