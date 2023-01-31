import type { Path, Media } from "types/generalTypes";

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

export function Header({ media, path, displayTitle = false }: HeaderProps) {
	const favorites = usePlaylists(favoritesSelector);
	const { t } = useTranslation();

	const isFavorite = favorites.has(path);

	return (
		<div className="media-player-header">
			<LoadOrToggleLyrics lyrics={media?.lyrics} path={path} />

			<div>{displayTitle ? media?.title : media?.album}</div>

			<CircleIconButton
				onPointerUp={() => toggleFavoriteMedia(path)}
				title={t("tooltips.toggleFavorite")}
				disabled={!path}
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
	path: Path;
};
