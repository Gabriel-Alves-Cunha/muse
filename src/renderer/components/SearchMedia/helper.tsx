import type { Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { useI18n } from "@solid-primitives/i18n";
import {
	type Component,
	type JSX,
	createEffect,
	createSignal,
	Show,
} from "solid-js";

import { ctxContentEnum, ContextMenu } from "../ContextMenu";
import { selectMediaByPointerEvent } from "../MediaListKind/helper";
import { searchMedia, unDiacritic } from "@contexts/usePlaylists";
import { MediaOptionsModal } from "../MediaListKind/MediaOptions";
import { VerticalDotsIcon } from "@icons/VerticalDotsIcon";
import { ImgWithFallback } from "../ImgWithFallback";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { MusicNoteIcon } from "@icons/MusicNoteIcon";
import { emptyString } from "@common/empty";
import { emptyArray } from "@common/empty";
import { RightSlot } from "../ContextMenu/RightSlot";
import { BaseInput } from "../BaseInput";
import { Portal } from "solid-js/web";
import { Dialog } from "../Dialog";

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

export const [getSearcher, setSearcher] = createSignal(defaultSearcher);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

createEffect(() => {
	// searchForMedias(highlight)
	const { highlight } = getSearcher();

	if (highlight.length < 2) return;

	setSearcher((prev) => ({
		...prev,
		results: emptyArray,
		searchStatus: SEARCHING,
	}));

	const results = searchMedia(highlight);
	const searchStatus = results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

	setSearcher((prev) => ({ ...prev, searchStatus, results }));
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setSearchTerm = (e: InputChange) =>
	setSearcher((prev) => ({
		...prev,
		highlight: unDiacritic(e.currentTarget.value),
		searchTerm: e.currentTarget.value,
	}));

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setIsInputOnFocus = (bool: boolean) =>
	setSearcher((prev) => ({ ...prev, isInputOnFocus: bool }));

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const setDefaultSearch = () => setSearcher(defaultSearcher);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Input: Component = () => {
	const { searchTerm, isInputOnFocus } = getSearcher();
	const [t] = useI18n();

	let input: HTMLInputElement | undefined;

	/////////////////////////////////////////

	// 	useEffect(() => {
	// 		function closeSearchMediaPopoverOnEsc(e: KeyboardEvent): void {
	// 			if (
	// 				e.key === "Escape" &&
	// 				getSearcher().isInputOnFocus === true &&
	// 				isAModifierKeyPressed(e) === false
	// 			) {
	// 				setSearcher(defaultSearcher);
	// 				input?.blur();
	// 			}
	// 		}
	//
	// 		document.addEventListener("keyup", closeSearchMediaPopoverOnEsc);
	//
	// 		return () =>
	// 			document.removeEventListener("keyup", closeSearchMediaPopoverOnEsc);
	// 	}, []);

	/////////////////////////////////////////

	return (
		<BaseInput
			RightSlot={
				<Show when={isInputOnFocus}>
					<RightSlot id="search">Alt+s</RightSlot>
				</Show>
			}
			onFocus={() => setIsInputOnFocus(true)}
			onBlur={() => setIsInputOnFocus(false)}
			label={t("labels.searchForSongs")}
			ref={input as HTMLInputElement}
			oninput={setSearchTerm}
			value={searchTerm}
			spellcheck={false}
			id="search-songs"
			accessKey="s"
		/>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const mantainFocusOnInput = (e: Event) => e.preventDefault();

export const Results: Component = () => {
	const { searchStatus, results, searchTerm, highlight } = getSearcher();
	const [isCtxMenuOpen, setIsCtxMenuOpen] = createSignal(false);
	const resultsJSXs: JSX.Element[] = [];

	/////////////////////////////////////////

	const foundSomething = () => searchStatus === FOUND_SOMETHING;
	const nothingFound = () => searchStatus === NOTHING_FOUND;
	const shouldPopoverOpen = () => foundSomething() || nothingFound();

	/////////////////////////////////////////

	for (const [path, media] of results)
		resultsJSXs.push(
			<MediaSearchRow highlight={highlight} media={media} path={path} />,
		);

	/////////////////////////////////////////

	return (
		<ContextMenu
			content={ctxContentEnum.SEARCH_MEDIA_OPTIONS}
			onContextMenu={selectMediaByPointerEvent}
			onOpenChange={setIsCtxMenuOpen}
			isAllDisabled={nothingFound()}
			isOpen={isCtxMenuOpen()}
		>
			<Dialog
				// onOpenAutoFocus={mantainFocusOnInput}
				onClickOutside={setDefaultSearch}
				isOpen={shouldPopoverOpen()}
				setIsOpen={() => {}}
				class={`transition-none ${
					nothingFound()
						? "nothing-found-for-search-media"
						: "search-media-results"
				}`}
			>
				<Show
					fallback={<Show when={foundSomething()}>{resultsJSXs}</Show>}
					when={nothingFound()}
				>
					<div class="absolute flex justify-center items-center left-[calc(64px+3.5vw)] w-80 top-24 rounded-xl p-3 shadow-popover bg-popover z-10 text-alternative font-secondary tracking-wider text-base text-center font-medium">
						Nothing was found for &quot;{searchTerm}&quot;
					</div>
				</Show>
			</Dialog>
		</ContextMenu>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const MediaSearchRow: Component<MediaSearchRowProps> = (props) => {
	const [isOpen, setIsOpen] = createSignal(false);
	const [t] = useI18n();

	const index = unDiacritic(props.media.title).indexOf(props.highlight);

	return (
		<div
			class="unset-all box-border relative flex justify-start items-center w-[98%] h-16 left-2 transition-none rounded-md transition-shadow "
			data-path={props.path}
		>
			<button
				onPointerUp={() => playThisMedia(props.path)}
				title={t("tooltips.playThisMedia")}
				type="button"
			>
				<div>
					<ImgWithFallback
						Fallback={<MusicNoteIcon class="w-3 h-3" />}
						mediaImg={props.media.image}
						mediaPath={props.path}
					/>
				</div>

				{/* size: "calc(100% - 5px)" */}
				<div class="flex flex-col items-start justify-center flex-1 m-1 overflow-hidden">
					<p class="pl-1 overflow-ellipsis text-alternative whitespace-nowrap font-secondary tracking-wide text-left text-base font-medium">
						{props.media.title.slice(0, index)}
						<span class="bg-highlight text-white">
							{props.media.title.slice(index, index + props.highlight.length)}
						</span>

						{props.media.title.slice(index + props.highlight.length)}
					</p>
				</div>
			</button>

			<button
				title={t("tooltips.openMediaOptions")}
				onPointerUp={() => setIsOpen(true)}
				type="button"
			>
				<VerticalDotsIcon class="w-4 h-4" />
			</button>

			<MediaOptionsModal
				setIsOpen={setIsOpen}
				media={props.media}
				path={props.path}
				isOpen={isOpen()}
				overlay="dim"
			/>
		</div>
	);
};

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

type MediaSearchRowProps = {
	highlight: string;
	media: Media;
	path: Path;
};

/////////////////////////////////////////

interface InputChange {
	currentTarget: HTMLInputElement;
}
