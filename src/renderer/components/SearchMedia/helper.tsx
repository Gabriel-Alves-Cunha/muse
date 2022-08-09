import type { Media, Path } from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { PopoverContent, PopoverRoot } from "@components/Popover";
import { MdMusicNote as MusicNote } from "react-icons/md";
import { subscribeWithSelector } from "zustand/middleware";
import { useEffect, useRef } from "react";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import create from "zustand";

import { CtxContentEnum, ContextMenu } from "@components/ContextMenu";
import { diacriticRegex, searchMedia } from "@contexts/usePlaylists";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { selectMediaByEvent } from "@components/MediaListKind/helper";
import { MediaOptionsModal } from "@components/MediaListKind/MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { t, Translator } from "@components/I18n";
import { DialogTrigger } from "@components/DialogTrigger";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { emptyArray } from "@utils/array";

import { Img, PlayButton, RowWrapper } from "../MediaListKind/styles";
import { StyledDialogBlurOverlay } from "@components/MediaListKind/MediaOptions/styles";
import { RightSlot } from "@components/ContextMenu/styles";
import {
	SearchMediaPopoverAnchor,
	NothingFound,
	Highlight,
	Title,
	Info,
} from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export enum SearchStatus {
	FOUND_SOMETHING,
	DOING_NOTHING,
	NOTHING_FOUND,
	SEARCHING,
}

const { FOUND_SOMETHING, NOTHING_FOUND, DOING_NOTHING, SEARCHING } =
	SearchStatus;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const defaultSearcher: Searcher = Object.freeze({
	searchStatus: DOING_NOTHING,
	isInputOnFocus: false,
	results: emptyArray,
	searchTerm: "",
	highlight: "",
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
		setSearcher({ results: emptyArray, searchStatus: SEARCHING });

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
		searchTerm: e.target.value,
		highlight: e.target.value.toLowerCase().normalize("NFD").replace(
			diacriticRegex,
			"",
		),
	});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setIsInputOnFocus = (bool: boolean) =>
	setSearcher({ isInputOnFocus: bool });

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
				e.key === "Escape" && getSearcher().isInputOnFocus === true &&
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
			<label htmlFor="search-songs">
				<Translator path="labels.searchForSongs" />
			</label>

			<input
				onFocus={() => setIsInputOnFocus(true)}
				onChange={setSearchTerm}
				value={searchTerm}
				spellCheck="false"
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

const searchStatusAndResultsSelector = (
	state: ReturnType<typeof useSearcher.getState>,
) => ({ searchStatus: state.searchStatus, results: state.results });

export function Results() {
	const { results, searchStatus } = useSearcher(searchStatusAndResultsSelector);

	/////////////////////////////////////////

	const foundSomething = searchStatus === FOUND_SOMETHING;
	const nothingFound = searchStatus === NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething === true || nothingFound === true;

	/////////////////////////////////////////

	return shouldPopoverOpen ?
		(
			<ContextMenu
				content={CtxContentEnum.SEARCH_MEDIA_OPTIONS}
				onContextMenu={selectMediaByEvent}
				isAllDisabled={nothingFound}
			>
				<PopoverRoot open={shouldPopoverOpen}>
					<SearchMediaPopoverAnchor />

					<PopoverContent
						size={nothingFound === true ?
							"nothing-found-for-search-media" :
							"search-media-results"}
						onPointerDownOutside={() => setSearcher(defaultSearcher)}
						// This is to mantain focus on the input:
						onOpenAutoFocus={e => e.preventDefault()}
						className="notransition"
					>
						{nothingFound === true ?
							(
								<NothingFound>
									Nothing was found for &quot;{getSearcher().searchTerm}&quot;
								</NothingFound>
							) :
							foundSomething === true ?
							(results.map(([path, media]) => (
								<MediaSearchRow
									highlight={getSearcher().highlight}
									media={media}
									path={path}
									key={path}
								/>
							))) :
							undefined}
					</PopoverContent>
				</PopoverRoot>
			</ContextMenu>
		) :
		null;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

function MediaSearchRow({ media, highlight, path }: MediaSearchRowProps) {
	/** normalize()ing to 'NFD' Unicode normal form decomposes
	 * combined graphemes into the combination of simple ones.
	 * The è of Crème ends up expressed as 'e' + ' ̀'.
	 * It is now trivial to globally get rid of the diacritics,
	 * which the Unicode standard conveniently groups as the
	 * Combining Diacritical Marks Unicode block.
	 */
	const index = media
		.title
		.toLowerCase()
		.normalize("NFD")
		.replace(diacriticRegex, "")
		.indexOf(highlight);

	return (
		<RowWrapper data-path={path}>
			<PlayButton
				data-tip={t("tooltips.playThisMedia")}
				onClick={() => playThisMedia(path)}
				data-place="right"
			>
				<Img>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaImg={media.image}
						mediaPath={path}
					/>
				</Img>

				<Info>
					<Title>
						{media.title.slice(0, index)}
						<Highlight>
							{media.title.slice(index, index + highlight.length)}
						</Highlight>
						{media.title.slice(index + highlight.length)}
					</Title>
				</Info>
			</PlayButton>

			<Dialog modal>
				<DialogTrigger tooltip={t("tooltips.openMediaOptions")}>
					<Dots size={17} />
				</DialogTrigger>

				<Portal>
					<StyledDialogBlurOverlay>
						<MediaOptionsModal media={media} path={path} />
					</StyledDialogBlurOverlay>
				</Portal>
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
		highlight: Lowercase<string>;
		searchStatus: SearchStatus;
		isInputOnFocus: boolean;
		searchTerm: string;
	}
>;

/////////////////////////////////////////

type MediaSearchRowProps = Readonly<
	{ highlight: Lowercase<string>; media: Media; path: Path; }
>;

/////////////////////////////////////////

type InputChange = Readonly<React.ChangeEvent<HTMLInputElement>>;
