import { useRef } from "react";

import { ContextMenu, CtxContentEnum } from "../ContextMenu";
import { selectT, useTranslator } from "@i18n";
import { MediaSearchRow } from "./MediaSearchRow";
import { RightSlot } from "../RightSlot";
import { BaseInput } from "../BaseInput";
import { Popover } from "../Popover";
import {
	setDefaultSearchMediaData,
	useDataOfSearchMedia,
	SearchStatusEnum,
	setSearchTerm,
} from "./state";

export function SearchMedia(): JSX.Element {
	const searchWrapperRef = useRef<HTMLDivElement>(null);
	const dataOfSearch = useDataOfSearchMedia();
	const t = useTranslator(selectT);

	/////////////////////////////////////////

	const foundSomething =
		dataOfSearch.searchStatus === SearchStatusEnum.FOUND_SOMETHING;
	const nothingFound =
		dataOfSearch.searchStatus === SearchStatusEnum.NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething || nothingFound;

	/////////////////////////////////////////

	const resultsFound = dataOfSearch.results.map(([path, media]) => (
		<MediaSearchRow
			highlight={dataOfSearch.highlight}
			media={media}
			path={path}
			key={path}
		/>
	));

	/////////////////////////////////////////

	return (
		<div ref={searchWrapperRef}>
			<BaseInput
				RightSlot={<RightSlot id="searcher-right-slot">Alt+s</RightSlot>}
				onEscape={setDefaultSearchMediaData}
				label={t("labels.searchForSongs")}
				value={dataOfSearch.searchTerm}
				onChange={setSearchTerm}
				spellCheck="false"
				autoCorrect="off"
				accessKey="s"
			/>

			{shouldPopoverOpen ? (
				<ContextMenu
					content={CtxContentEnum.SEARCH_MEDIA_OPTIONS}
					isAllDisabled={foundSomething}
				>
					<Popover
						size={
							nothingFound
								? "nothing-found-for-search-media"
								: "search-media-results"
						}
						onPointerDownOutside={setDefaultSearchMediaData}
						onEscape={setDefaultSearchMediaData}
						contentRef={searchWrapperRef}
					>
						{nothingFound ? (
							<div className="nothing-found">
								Nothing was found for &quot;{dataOfSearch.searchTerm}&quot;
							</div>
						) : (
							resultsFound
						)}
					</Popover>
				</ContextMenu>
			) : null}
		</div>
	);
}
