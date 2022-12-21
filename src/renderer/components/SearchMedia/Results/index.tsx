import { SearchStatus, setDefaultSearch, useSearcher } from "../state";
import { CtxContentEnum, ContextMenu } from "@components/ContextMenu";
import { PopoverContent, PopoverRoot } from "@components/Popover";
import { selectMediaByPointerEvent } from "@components/MediaListKind/helper";
import { MediaSearchRow } from "./MediaSearchRow";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const mantainFocusOnInput = (e: Event) => e.preventDefault();

export const Results = () => {
	const { searchStatus, results, searchTerm, highlight } = useSearcher();
	const resultsJSXs: JSX.Element[] = [];

	/////////////////////////////////////////

	const foundSomething = searchStatus === SearchStatus.FOUND_SOMETHING;
	const nothingFound = searchStatus === SearchStatus.NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething || nothingFound;

	/////////////////////////////////////////

	for (const [path, media] of results)
		resultsJSXs.push(
			<MediaSearchRow
				highlight={highlight}
				media={media}
				id={path}
				key={path}
			/>,
		);

	/////////////////////////////////////////

	return (
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
						// TODO: Wrap break word
						<div className="absolute flex justify-center items-center left-[calc(64px+3.5vw)] w-80 top-24 rounded-xl p-3 shadow-popover bg-popover z-10 text-alternative font-secondary tracking-wider text-base text-center font-medium">
							Nothing was found for &quot;{searchTerm}&quot;
						</div>
					) : foundSomething ? (
						resultsJSXs
					) : undefined}
				</PopoverContent>
			</PopoverRoot>
		</ContextMenu>
	);
};
