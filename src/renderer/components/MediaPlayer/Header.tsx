import type { ID, Media } from "@common/@types/generalTypes";

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
import { useTranslation } from "@i18n";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const openLyrics = true;

const LoadOrToggleLyrics = ({ lyrics, id }: LoadOrToggleLyricsProps) => {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
	const { t } = useTranslation();

	const loadAndOrToggleLyrics = async (): Promise<void> => {
		if (lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(id, openLyrics);
		setIsLoadingLyrics(false);
	};

	return (
		<CircleIconButton
			title={t("tooltips.toggleOpenLyrics")}
			onPointerUp={loadAndOrToggleLyrics}
			disabled={!id}
		>
			{lyrics ? (
				<LyricsPresent size={16} />
			) : isLoadingLyrics ? (
				<RingLoader className="absolute text-white w-8 h-8" />
			) : (
				<NoLyrics size={16} />
			)}
		</CircleIconButton>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const favoritesSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.favorites;

export const Header = ({ media, id, displayTitle = false }: HeaderProps) => {
	const favorites = usePlaylists(favoritesSelector);
	const { t } = useTranslation();

	const isFavorite = favorites.has(id);

	return (
		<div className="flex justify-between items-center">
			<LoadOrToggleLyrics lyrics={media?.lyrics} id={id} />

			<div className="w-[calc(100%-52px)] text-icon-media-player font-secondary tracking-wider text-center text-base font-medium">
				{displayTitle ? media?.title : media?.album}
			</div>

			<CircleIconButton
				onPointerUp={() => toggleFavoriteMedia(id)}
				title={t("tooltips.toggleFavorite")}
				disabled={!id}
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

type HeaderProps = {
	media: Media | undefined;
	displayTitle?: boolean;
	id: ID;
};
/////////////////////////////////////////

type LoadOrToggleLyricsProps = {
	lyrics: string | undefined;
	id: ID;
};
