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

const favoritesSelector = ({
	favorites,
}: ReturnType<typeof usePlaylists.getState>) => favorites;

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
