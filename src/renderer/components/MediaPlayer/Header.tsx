import type { Media, Path } from "@common/@types/generalTypes";

import { type Component, createSignal, Show } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { flipMediaPlayerCard, searchAndOpenLyrics } from "./Lyrics";
import { JournalTextIcon as LyricsPresentIcon } from "@icons/JournalTextIcon";
import { toggleFavoriteMedia, usePlaylists } from "@contexts/usePlaylists";
import { JournalIcon as NoLyricsIcon } from "@icons/JournalIcon";
import { CircleIconButton } from "../CircleIconButton";
import { HeartIcon } from "@icons/HeartIcon";
import { Spinner } from "../Spinner";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const openLyrics = true;

const LoadOrToggleLyrics: Component<LoadOrToggleLyricsProps> = (props) => {
	const [isLoadingLyrics, setIsLoadingLyrics] = createSignal(false);
	const [t] = useI18n();

	async function loadAndOrToggleLyrics(): Promise<void> {
		if (props.media?.lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(props.media, props.path, openLyrics);
		setIsLoadingLyrics(false);
	}

	return (
		<CircleIconButton
			title={t("tooltips.toggleOpenLyrics")}
			onPointerUp={loadAndOrToggleLyrics}
			disabled={props.media === undefined}
		>
			<Show
				when={props.media?.lyrics}
				fallback={
					<Show
						fallback={<NoLyricsIcon class="w-4 h-4" />}
						when={isLoadingLyrics()}
					>
						<Spinner class="absolute text-white w-4 h-4" />
					</Show>
				}
			>
				<LyricsPresentIcon class="w-4 h-4" />
			</Show>
		</CircleIconButton>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Header: Component<HeaderProps> = (props) => {
	const favorites = usePlaylists((state) => state.favorites);
	const isFavorite = () => favorites.has(props.path);
	const [t] = useI18n();

	return (
		<div class="flex justify-between items-center">
			<LoadOrToggleLyrics media={props.media} path={props.path} />

			<div class="w-[calc(100%-52px)] text-icon-media-player font-secondary tracking-wider text-center text-base font-medium">
				{props.displayTitle ? props.media?.title : props.media?.album}
			</div>

			<CircleIconButton
				onPointerUp={() => toggleFavoriteMedia(props.path)}
				title={t("tooltips.toggleFavorite")}
				disabled={!props.media}
			>
				<Show when={isFavorite()} fallback={<HeartIcon class="w-4 h-4" />}>
					<HeartIcon class="w-4 h-4 fill-red-600" />
				</Show>
			</CircleIconButton>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type HeaderProps = {
	media: Media | undefined;
	displayTitle?: boolean;
	path: Path;
};
/////////////////////////////////////////

type LoadOrToggleLyricsProps = {
	media: Media | undefined;
	path: Path;
};
