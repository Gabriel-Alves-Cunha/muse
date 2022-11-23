import type { Media, Path } from "@common/@types/generalTypes";

import { BsJournalText as LyricsPresent } from "react-icons/bs";
import { BsJournal as NoLyrics } from "react-icons/bs";
import { RingLoader } from "react-spinners";
import { useState } from "react";
import {
	MdFavoriteBorder as AddFavorite,
	MdFavorite as Favorite,
} from "react-icons/md";

import { flipMediaPlayerCard, searchAndOpenLyrics } from "./Lyrics";
import { toggleFavoriteMedia, usePlaylists } from "@contexts/usePlaylists";
import { CircleIconButton } from "@components/CircleIconButton";
import { t } from "@components/I18n";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const openLyrics = true;

function LoadOrToggleLyrics({ media, path }: LoadOrToggleLyricsProps) {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

	async function loadAndOrToggleLyrics(): Promise<void> {
		if (media?.lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(media, path, openLyrics);
		setIsLoadingLyrics(false);
	}

	return (
		<CircleIconButton
			title={t("tooltips.toggleOpenLyrics")}
			onPointerUp={loadAndOrToggleLyrics}
			disabled={media === undefined}
		>
			{media?.lyrics ? (
				<LyricsPresent size={16} />
			) : isLoadingLyrics ? (
				<RingLoader className="absolute text-white w-8 h-8" />
			) : (
				<NoLyrics size={16} />
			)}
		</CircleIconButton>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const favoritesSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.favorites;

export const Header = ({ media, path, displayTitle = false }: HeaderProps) => {
	const favorites = usePlaylists(favoritesSelector);
	const isFavorite = favorites.has(path);

	return (
		<div className="flex justify-between items-center">
			<LoadOrToggleLyrics media={media} path={path} />

			<div className="w-[calc(100%-52px)] text-icon-media-player font-secondary tracking-wider text-center text-base font-medium">
				{displayTitle ? media?.title : media?.album}
			</div>

			<CircleIconButton
				onPointerUp={() => toggleFavoriteMedia(path)}
				title={t("tooltips.toggleFavorite")}
				disabled={!media}
			>
				{isFavorite ? <Favorite size={17} /> : <AddFavorite size={17} />}
			</CircleIconButton>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type HeaderProps = Readonly<{
	media: Media | undefined;
	displayTitle?: boolean;
	path: Path;
}>;
/////////////////////////////////////////

type LoadOrToggleLyricsProps = Readonly<{
	media: Media | undefined;
	path: Path;
}>;
