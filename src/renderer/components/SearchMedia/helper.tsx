import type { Media, Path } from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { PopoverContent, PopoverRoot } from "@components/Popover/Popover";
import { MdMusicNote as MusicNote } from "react-icons/md";
import { subscribeWithSelector } from "zustand/middleware";
import { Dialog, DialogPortal } from "@radix-ui/react-dialog";
import { useEffect, useRef } from "react";
import create from "zustand";

import { ctxContentEnum, ContextMenu } from "@components/ContextMenu";
import { searchMedia, unDiacritic } from "@contexts/usePlaylists";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { selectMediaByEvent } from "@components/MediaListKind/helper";
import { MediaOptionsModal } from "@components/MediaListKind/MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { t, Translator } from "@components/I18n";
import { DialogTrigger } from "@components/DialogTrigger/DialogTrigger";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { emptyArray } from "@utils/array";

import { Img, PlayButton, RowWrapper } from "../MediaListKind/styles";
import { StyledDialogBlurOverlay } from "@components/MediaListKind/MediaOptions/styles";
import { emptyString } from "@common/empty";
import { RightSlot } from "@components/ContextMenu/styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export enum SearchStatus {
	FOUND_SOMETHING,
	DOING_NOTHING,
	NOTHING_FOUND,
	SEARCHING,
}

const { FOUND_SOMETHING, NOTHING_FOUND, DOING_NOTHING } = SearchStatus;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const defaultSearcher: Searcher = Object.freeze({
	searchStatus: DOING_NOTHING,
	searchTerm: emptyString,
	highlight: emptyString,
	isInputOnFocus: false,
	results: emptyArray,
});

const useSearcher = create<Searcher>()(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	subscribeWithSelector((_set, _get, _api) => defaultSearcher),
);

export const { setState: setSearcher, getState: getSearcher } = useSearcher;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

useSearcher.subscribe(
	state => state.highlight,
	function searchForMedias(highlight): void {
		// setSearcher({ results: emptyArray, searchStatus: SEARCHING });

		if (highlight.length < 2) return;

		const results = searchMedia(highlight);
		const searchStatus = results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

		setSearcher({ searchStatus, results });
	},
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setSearchTerm = (e: InputChange) =>
	setSearcher({
		highlight: unDiacritic(e.target.value),
		searchTerm: e.target.value,
	});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setIsInputOnFocus = (bool: boolean) =>
	setSearcher({ isInputOnFocus: bool });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setDefaultSearch = () => setSearcher(defaultSearcher);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const searchTermSelector = (state: ReturnType<typeof useSearcher.getState>) =>
	state.searchTerm;

export function Input() {
	const searchTerm = useSearcher(searchTermSelector);
	const inputRef = useRef<HTMLInputElement>(null);

	/////////////////////////////////////////

	useEffect(() => {
		function closeSearchMediaPopoverOnEsc(e: KeyboardEvent): void {
			if (
				e.key === "Escape" &&
				getSearcher().isInputOnFocus === true &&
				isAModifierKeyPressed(e) === false
			) {
				setSearcher(defaultSearcher);
				inputRef.current?.blur();
			}
		}

		document.addEventListener("keyup", closeSearchMediaPopoverOnEsc);

		return () =>
			document.removeEventListener("keyup", closeSearchMediaPopoverOnEsc);
	}, []);

	/////////////////////////////////////////

	return (
		<>
			<label
				className="absolute flex items-center w-[85%] h-10 left-7 bottom-0 right-0 top-0 m-auto p-0 text-placeholder whitespace-nowrap font-secondary tracking-wider font-normal text-base cursor-default transition-label hover:active-label focus:active-label focus-within:active-label"
				htmlFor="search-songs"
			>
				<Translator path="labels.searchForSongs" />
			</label>

			<input
				// flex: 1 => occupy all remaining width
				className="absolute flex items-center flex-1 h-9 left-[38px] bottom-0 right-0 top-0 whitespace-nowrap text-input font-primary cursor-text tracking-wider text-base font-medium outline-none bg-none border-none"
				onFocus={() => setIsInputOnFocus(true)}
				onChange={setSearchTerm}
				value={searchTerm}
				spellCheck="false"
				id="search-songs"
				autoCorrect="off"
				ref={inputRef}
				accessKey="s"
			/>

			{getSearcher().isInputOnFocus === false && (
				<RightSlot id="search">Alt+s</RightSlot>
			)}
		</>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const mantainFocusOnInput = (e: Event) => e.preventDefault();

export function Results() {
	const { searchStatus, results, searchTerm, highlight } = useSearcher();

	/////////////////////////////////////////

	const foundSomething = searchStatus === FOUND_SOMETHING;
	const nothingFound = searchStatus === NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething || nothingFound;

	/////////////////////////////////////////

	return (
		<ContextMenu
			content={ctxContentEnum.SEARCH_MEDIA_OPTIONS}
			onContextMenu={selectMediaByEvent}
			isAllDisabled={nothingFound}
		>
			<PopoverRoot open={shouldPopoverOpen}>
				<PopoverContent
					size={nothingFound ?
						"nothing-found-for-search-media" :
						"search-media-results"}
					onPointerDownOutside={setDefaultSearch}
					onOpenAutoFocus={mantainFocusOnInput}
					className="notransition"
				>
					{nothingFound ?
						(
							// zIndex: 100
							<div className="absolute flex justify-center items-center left-[calc(64px+3.5vw)] w-80 top-48 rounded-xl p-3 shadow-popover bg-popover z-10 text-icon-deactivated font-secondary tracking-wide text-base text-center font-medium">
								Nothing was found for &quot;{searchTerm}&quot;
							</div>
						) :
						foundSomething ?
						(results.map(([path, media]) => (
							<MediaSearchRow
								highlight={highlight}
								media={media}
								path={path}
								key={path}
							/>
						))) :
						undefined}
				</PopoverContent>
			</PopoverRoot>
		</ContextMenu>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

function MediaSearchRow({ media, highlight, path }: MediaSearchRowProps) {
	const index = unDiacritic(media.title).indexOf(highlight);

	return (
		<RowWrapper data-path={path}>
			<PlayButton
				aria-label={t("tooltips.playThisMedia")}
				onPointerUp={() => playThisMedia(path)}
				title={t("tooltips.playThisMedia")}
			>
				<Img>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaImg={media.image}
						mediaPath={path}
					/>
				</Img>

				{/* size: "calc(100% - 5px)" */}
				<div className="flex flex-col items-start justify-center flex-1 m-1 overflow-hidden">
					<p className="pl-1 overflow-ellipsis text-alternative whitespace-nowrap font-secondary tracking-wide text-left text-base font-medium">
						{media.title.slice(0, index)}
						<span className="bg-highlight text-white">
							{media.title.slice(index, index + highlight.length)}
						</span>
						{media.title.slice(index + highlight.length)}
					</p>
				</div>
			</PlayButton>

			<Dialog modal>
				<DialogTrigger tooltip={t("tooltips.openMediaOptions")}>
					<Dots size={17} />
				</DialogTrigger>

				<DialogPortal>
					<StyledDialogBlurOverlay>
						<MediaOptionsModal media={media} path={path} />
					</StyledDialogBlurOverlay>
				</DialogPortal>
			</Dialog>
		</RowWrapper>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Searcher = Readonly<
	{
		results: readonly [Path, Media][];
		searchStatus: SearchStatus;
		isInputOnFocus: boolean;
		searchTerm: string;
		highlight: string;
	}
>;

/////////////////////////////////////////

type MediaSearchRowProps = Readonly<
	{ highlight: string; media: Media; path: Path; }
>;

/////////////////////////////////////////

type InputChange = Readonly<React.ChangeEvent<HTMLInputElement>>;
