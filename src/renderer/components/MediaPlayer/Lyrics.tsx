import type { ID, Media } from "@common/@types/generalTypes";

import { ReactToElectronMessage } from "@common/enums";
import { mediaPlayerFlipCardId } from "../FlipCard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { useTranslation } from "@i18n";
import { error, warn } from "@common/log";
import { infoToast } from "../toasts";
import { getMedia } from "@contexts/usePlaylists";
import { Header } from "./Header";

const { searchForLyricsAndImage } = electron.lyric;

/////////////////////////////////////////

export const Lyrics = ({ media, id }: Props) => (
	<div className="lyrics-wrapper">
		<Header media={media} id={id} displayTitle />

		<div className="lyrics">
			<p>{media?.lyrics}</p>
		</div>
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

export const flipMediaPlayerCard = (): void =>
	document
		.getElementById(mediaPlayerFlipCardId)
		?.classList.toggle("active") as void;

/////////////////////////////////////////


export async function searchAndOpenLyrics(
	mediaID: ID,
	openLyrics: boolean,
): Promise<void> {
	if (!mediaID) return error(`No mediaID provided. Received "${mediaID}"!`);

	const media = getMedia(mediaID);

	if (!media) return warn(`No media with id = "${mediaID}" found!`);
	
	const { t } = useTranslation();
	
	if (!media.artist) {

		infoToast(t("toasts.assureMediaHasArtistMetadata"));
		return;
	}

	// If there is no image already, go get one:
	const getImage = !media.image;

	try {
		const { lyric, image, albumName } = await searchForLyricsAndImage(
			media.title,
			media.artist,
			getImage,
		);

		sendMsgToBackend({
			type: ReactToElectronMessage.WRITE_TAG,
			thingsToChange: [
				{ whatToChange: "album", newValue: albumName },
				{ whatToChange: "imageURL", newValue: image },
				{ whatToChange: "lyrics", newValue: lyric },
			],
			mediaPath: media.path,
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

type Props = { media: Media | undefined; id: ID };
