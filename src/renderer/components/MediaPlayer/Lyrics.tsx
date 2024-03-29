import type { Path, Media } from "@common/@types/GeneralTypes";

import { ReactToElectronMessageEnum } from "@common/enums";
import { MEDIA_PLAYER_FLIP_CARD_ID } from "../FlipCard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { error, warn } from "@common/log";
import { infoToast } from "../toasts";
import { getMedia } from "@contexts/playlists";
import { Header } from "./Header";
import { t } from "@i18n";

const { searchForLyricsAndImage } = electronApi.lyric;

/////////////////////////////////////////

export const Lyrics = ({ media, path }: Props): JSX.Element => (
	<div className="lyrics-wrapper">
		<Header media={media} path={path} displayTitle />

		<div className="lyrics">
			<p>{media?.lyrics}</p>
		</div>
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

export function flipMediaPlayerCard(): void {
	document
		.getElementById(MEDIA_PLAYER_FLIP_CARD_ID)
		?.classList.toggle("active");
}

/////////////////////////////////////////

export async function searchAndOpenLyrics(
	mediaPath: Path,
	openLyrics: boolean,
): Promise<void> {
	if (!mediaPath) return error("No 'mediaPath' provided");

	const media = getMedia(mediaPath);

	if (!media) return warn(`Media "${mediaPath}" not found!`);

	if (!media.artist) {
		infoToast(t("toasts.assureMediaHasArtistMetadata"));
		return;
	}

	// If there is no image already, go get one:
	const shouldGetImage = !media.image;

	try {
		const { lyric, image, albumName } = await searchForLyricsAndImage(
			media.title,
			media.artist,
			shouldGetImage,
		);

		sendMsgToBackend({
			thingsToChange: [
				{ whatToChange: "album", newValue: albumName },
				{ whatToChange: "imageURL", newValue: image },
				{ whatToChange: "lyrics", newValue: lyric },
			],
			type: ReactToElectronMessageEnum.WRITE_TAG,
			mediaPath,
		});
	} catch (err) {
		if ((err as Error).message.includes("No lyrics found"))
			infoToast(`${t("toasts.noLyricsFound")}"${media.title}"!`);

		error(err);
	}

	if (media.lyrics && openLyrics) return flipMediaPlayerCard();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ media: Media | undefined; path: Path }>;
