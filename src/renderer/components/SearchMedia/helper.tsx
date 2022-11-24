import type { Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { Dialog, DialogPortal, Overlay } from "@radix-ui/react-dialog";
import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { PopoverContent, PopoverRoot } from "@components/Popover";
import { MdMusicNote as MusicNote } from "react-icons/md";
import { subscribeWithSelector } from "zustand/middleware";
import { useEffect, useRef } from "react";
import create from "zustand";

import { ctxContentEnum, ContextMenu } from "@components/ContextMenu";
import { selectMediaByPointerEvent } from "@components/MediaListKind/helper";
import { searchMedia, unDiacritic } from "@contexts/usePlaylists";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { MediaOptionsModal } from "@components/MediaListKind/MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { DialogTrigger } from "@components/DialogTrigger";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { emptyString } from "@common/empty";
import { emptyArray } from "@utils/array";
import { RightSlot } from "@components/ContextMenu/RightSlot";
import { BaseInput } from "@components/BaseInput";
import { t } from "@components/I18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const searchStatus = {
	FOUND_SOMETHING: 2,
	DOING_NOTHING: 3,
	NOTHING_FOUND: 4,
	SEARCHING: 5,
} as const;

const { FOUND_SOMETHING, NOTHING_FOUND, DOING_NOTHING, SEARCHING } =
	searchStatus;

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
	subscribeWithSelector((_set, _get, _api) => defaultSearcher),
);

export const { setState: setSearcher, getState: getSearcher } = useSearcher;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

useSearcher.subscribe(
	(state) => state.highlight,
	function searchForMedias(highlight): void {
		if (highlight.length < 2) return;

		setSearcher({ results: emptyArray, searchStatus: SEARCHING });

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

const searchInputSelector = (
	state: ReturnType<typeof useSearcher.getState>,
) => ({ searchTerm: state.searchTerm, isInputOnFocus: state.isInputOnFocus });

export function Input() {
	const { searchTerm, isInputOnFocus } = useSearcher(searchInputSelector);
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
		<BaseInput
			RightSlot={
				isInputOnFocus ? null : <RightSlot id="search">Alt+s</RightSlot>
			}
			onFocus={() => setIsInputOnFocus(true)}
			onBlur={() => setIsInputOnFocus(false)}
			label={t("labels.searchForSongs")}
			onChange={setSearchTerm}
			value={searchTerm}
			spellCheck="false"
			id="search-songs"
			autoCorrect="off"
			ref={inputRef}
			accessKey="s"
		/>
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
						<div className="absolute flex justify-center items-center left-[calc(64px+3.5vw)] w-80 top-24 rounded-xl p-3 shadow-popover bg-popover z-10 text-alternative font-secondary tracking-wider text-base text-center font-medium">
							Nothing was found for &quot;{searchTerm}&quot;
						</div>
					) : foundSomething ? (
						results.map(([path, media]) => (
							<MediaSearchRow
								highlight={highlight}
								media={media}
								path={path}
								key={path}
							/>
						))
					) : undefined}
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
		<div
			className="unset-all box-border relative flex justify-start items-center w-[98%] h-16 left-2 transition-none rounded-md transition-shadow "
			data-path={path}
		>
			<button
				onPointerUp={() => playThisMedia(path)}
				title={t("tooltips.playThisMedia")}
			>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaImg={media.image}
						mediaPath={path}
					/>
				</div>

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
			</button>

			<Dialog modal>
				<DialogTrigger tooltip={t("tooltips.openMediaOptions")}>
					<Dots size={17} />
				</DialogTrigger>

				<DialogPortal>
					<Overlay className="fixed grid place-items-center bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 overflow-y-auto z-20 animation-overlay-show" />

					<MediaOptionsModal media={media} path={path} />
				</DialogPortal>
			</Dialog>
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Searcher = Readonly<{
	searchStatus: ValuesOf<typeof searchStatus>;
	results: readonly [Path, Media][];
	isInputOnFocus: boolean;
	searchTerm: string;
	highlight: string;
}>;

/////////////////////////////////////////

type MediaSearchRowProps = Readonly<{
	highlight: string;
	media: Media;
	path: Path;
}>;

/////////////////////////////////////////

type InputChange = Readonly<React.ChangeEvent<HTMLInputElement>>;
