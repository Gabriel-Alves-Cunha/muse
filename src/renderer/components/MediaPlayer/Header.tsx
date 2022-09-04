import type { Media, Path } from "@common/@types/generalTypes";

import { BsJournalText as LyricsPresent } from "react-icons/bs";
import { type CSSProperties, useState } from "react";
import { BsJournal as NoLyrics } from "react-icons/bs";
import { RingLoader } from "react-spinners";
import {
	MdFavoriteBorder as AddFavorite,
	MdFavorite as Favorite,
} from "react-icons/md";

import { flipMediaPlayerCard, searchAndOpenLyrics } from "./Lyrics";
import { t } from "@components/I18n";
import {
	PlaylistActions,
	setPlaylists,
	getFavorites,
	WhatToDo,
} from "@contexts/usePlaylists";

import { CircledIconButton, OptionsAndAlbum, Album } from "./styles";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

function toggleFavorite(path: Readonly<Path>): void {
	if (path.length > 0)
		setPlaylists({
			whatToDo: PlaylistActions.TOGGLE_ONE_MEDIA,
			type: WhatToDo.UPDATE_FAVORITES,
			path,
		});
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const putLoaderOnTopOfLyricsSvg: CSSProperties = { position: "absolute" };

export const openLyrics = true;

function LoadOrToggleLyrics({ media, path }: LoadOrToggleLyricsProps) {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

	async function loadAndOrToggleLyrics(): Promise<void> {
		if (media?.lyrics)
			return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(media, path, openLyrics);
		setIsLoadingLyrics(false);
	}

	return (
		<CircledIconButton
			aria-label={t("tooltips.toggleOpenLyrics")}
			title={t("tooltips.toggleOpenLyrics")}
			onPointerUp={loadAndOrToggleLyrics}
			disabled={media === undefined}
		>
			{media?.lyrics ?
				<LyricsPresent size={16} /> :
				isLoadingLyrics === true ?
				(
					<RingLoader
						cssOverride={putLoaderOnTopOfLyricsSvg}
						color="white"
						size={30}
					/>
				) :
				<NoLyrics size={16} />}
		</CircledIconButton>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Header = ({ media, path, displayTitle = false }: HeaderProps) => (
	<OptionsAndAlbum>
		<LoadOrToggleLyrics media={media} path={path} />

		<Album>{displayTitle === true ? media?.title : media?.album}</Album>

		<CircledIconButton
			aria-label={t("tooltips.toggleFavorite")}
			onPointerUp={() => toggleFavorite(path)}
			title={t("tooltips.toggleFavorite")}
			disabled={media === undefined}
		>
			{getFavorites().has(path) === true ?
				<Favorite size={17} /> :
				<AddFavorite size={17} />}
		</CircledIconButton>
	</OptionsAndAlbum>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type HeaderProps = Readonly<
	{ media: Media | undefined; displayTitle?: boolean; path: Path; }
>;
/////////////////////////////////////////

type LoadOrToggleLyricsProps = Readonly<
	{ media: Media | undefined; path: Path; }
>;
