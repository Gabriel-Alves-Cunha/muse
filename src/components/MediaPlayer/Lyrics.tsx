import type { Path, Media } from "types/generalTypes";

import { mediaPlayerFlipCardId } from "../FlipCard";
// import { sendMsgToBackend } from "@utils/crossCommunication";
import { MessageToBackend } from "@utils/enums";
import { useTranslation } from "@i18n";
import { error, warn } from "@utils/log";
import { infoToast } from "../toasts";
import { getMedia } from "@contexts/usePlaylists";
import { Header } from "./Header";

// const { searchForLyricsAndImage } = electron.lyric;

/////////////////////////////////////////

export const Lyrics = ({ media, path }: Props) => (
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

export const flipMediaPlayerCard = (): void =>
	document
		.getElementById(mediaPlayerFlipCardId)
		?.classList.toggle("active") as void;

/////////////////////////////////////////

export async function searchAndOpenLyrics(
	mediaPath: Path,
	openLyrics: boolean,
): Promise<void> {
	if (!mediaPath) return error("No 'mediaPath' provided");

	const media = getMedia(mediaPath);

	if (!media) return warn(`Media "${mediaPath}" not found!`);

	const { t } = useTranslation.getState();

	if (!media.artist) {
		infoToast(t("toasts.assureMediaHasArtistMetadata"));
		return;
	}

	// If there is no image already, go get one:
	const getImage = !media.image;

	try {
		const { lyric, image, albumName } = { lyric: "", image: "", albumName: "" }; // await searchForLyricsAndImage(
		// 	media.title,
		// 	media.artist,
		// 	getImage,
		// );

		// sendMsgToBackend({
		// 	thingsToChange: [
		// 		{ whatToChange: "album", newValue: albumName },
		// 		{ whatToChange: "imageURL", newValue: image },
		// 		{ whatToChange: "lyrics", newValue: lyric },
		// 	],
		// 	type: MessageToBackend.WRITE_TAG,
		// 	mediaPath,
		// });
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

type Props = { media: Media | undefined; path: Path };
