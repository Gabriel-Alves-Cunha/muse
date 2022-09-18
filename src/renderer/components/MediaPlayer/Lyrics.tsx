import type { Media, Path } from "@common/@types/generalTypes";

import { ReactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { mediaPlayerCardId } from "@components/FlipCard";
import { infoToast } from "@styles/global";
import { Header } from "./Header";
import { t } from "@components/I18n";

import { LyricsCardWrapper, LyricsHolder } from "./styles";

const { searchForLyricsAndImage } = electron.lyric;

/////////////////////////////////////////

export function Lyrics({ media, path }: Props) {
	return (
		<LyricsCardWrapper>
			<Header media={media} path={path} displayTitle />

			<LyricsHolder>
				<p>{media?.lyrics}</p>
			</LyricsHolder>
		</LyricsCardWrapper>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

export function flipMediaPlayerCard(): void {
	document.getElementById(mediaPlayerCardId)?.classList.toggle("active");
}

/////////////////////////////////////////

export async function searchAndOpenLyrics(
	media: Media | undefined,
	mediaPath: Path,
	openLyrics: boolean,
): Promise<void> {
	if (media === undefined) return;

	if (media.artist.length === 0) {
		infoToast(t("toasts.assureMediaHasArtistMetadata"));
		return;
	}

	// If there is no image already, go get one:
	const getImage = media.image.length === 0;

	try {
		const { lyric, image, albumName } = await searchForLyricsAndImage(
			media.title,
			media.artist,
			getImage,
		);

		sendMsgToBackend({
			type: ReactToElectronMessage.WRITE_TAG,
			// dprint-ignore
			thingsToChange: [
				{ whatToChange: "album", newValue: albumName },
				{ whatToChange: "imageURL",	newValue: image	},
				{ whatToChange: "lyrics", newValue: lyric }
			],
			mediaPath,
		});
	} catch (error) {
		if ((error as Error).message.includes("No lyrics found"))
			infoToast(`${t("toasts.noLyricsFound")}"${media.title}"!`);

		console.error(error);
	}

	if (media.lyrics.length > 0 && openLyrics === true)
		return flipMediaPlayerCard();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{ media: Media | undefined; path: Path; }>;
