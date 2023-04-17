import type { Path, Media } from "@common/@types/GeneralTypes";

import {
	MdFavoriteBorder as AddFavorite,
	MdFavorite as Favorite,
} from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import { LoadOrToggleLyrics } from "./LoadOrToggleLyrics";
import { CircleIconButton } from "@components/CircleIconButton";
import {
	toggleFavoriteMedia,
	selectFavorites,
	usePlaylists,
} from "@contexts/playlists";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function Header({
	displayTitle = false,
	media,
	path,
}: HeaderProps): JSX.Element {
	const t = useTranslator(selectT);

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

function IsFavorite({ path }: { path: Path }): JSX.Element {
	const isFavorite = usePlaylists(selectFavorites).has(path);

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
