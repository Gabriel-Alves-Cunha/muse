import type { ID, Media } from "@common/@types/generalTypes";

import {
	MdFavoriteBorder as AddFavorite,
	MdFavorite as Favorite,
} from "react-icons/md";

import { toggleFavoriteMedia, usePlaylists } from "@contexts/usePlaylists";
import { LoadOrToggleLyrics } from "./LoadOrToggleLyrics";
import { CircleIconButton } from "@components/CircleIconButton";
import { useTranslation } from "@i18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const favoritesSelector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.favorites;

export function Header({ media, id, displayTitle = false }: HeaderProps) {
	const favorites = usePlaylists(favoritesSelector);
	const { t } = useTranslation();

	const isFavorite = favorites.has(id);

	return (
		<div className="media-player-header">
			<LoadOrToggleLyrics lyrics={media?.lyrics} id={id} />

			<div>{displayTitle ? media?.title : media?.album}</div>

			<CircleIconButton
				onPointerUp={() => toggleFavoriteMedia(id)}
				title={t("tooltips.toggleFavorite")}
				disabled={!id}
			>
				{isFavorite ? <Favorite size={17} /> : <AddFavorite size={17} />}
			</CircleIconButton>
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type HeaderProps = {
	media: Media | undefined;
	displayTitle?: boolean;
	id: ID;
};
