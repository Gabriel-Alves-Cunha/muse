import type { Path, Media } from "@common/@types/GeneralTypes";

import { useSnapshot } from "valtio";
import {
	MdFavoriteBorder as AddFavorite,
	MdFavorite as Favorite,
} from "react-icons/md";

import { toggleFavoriteMedia, playlists } from "@contexts/playlists";
import { LoadOrToggleLyrics } from "./LoadOrToggleLyrics";
import { CircleIconButton } from "@components/CircleIconButton";
import { translation } from "@i18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function Header({ media, path, displayTitle = false }: HeaderProps) {
	const t = useSnapshot(translation).t;

	return (
		<div className="media-player-header">
			<LoadOrToggleLyrics lyrics={media?.lyrics} path={path} />

			<div>{displayTitle ? media?.title : media?.album}</div>

			<CircleIconButton
				onPointerUp={() => toggleFavoriteMedia(path)}
				title={t("tooltips.toggleFavorite")}
				disabled={!path}
			>
				<IsFavorite path={path} />
			</CircleIconButton>
		</div>
	);
}

function IsFavorite({ path }: { path: Path }) {
	const playlistsAccessor = useSnapshot(playlists);

	const isFavorite = playlistsAccessor.favorites.has(path);

	return isFavorite ? <Favorite size={17} /> : <AddFavorite size={17} />;
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
