import type { Media, Path } from "@common/@types/generalTypes";

import { reactToElectronMessage } from "@common/enums";
import { mediaPlayerCardId } from "@components/FlipCard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { useTranslation } from "@i18n";
import { infoToast } from "@components/toasts";
import { Header } from "./Header";
import { error } from "@utils/log";

const { searchForLyricsAndImage } = electron.lyric;

/////////////////////////////////////////

export function Lyrics({ media, path }: Props) {
	return (
		<div className="relative w-full h-full">
			<Header media={media} path={path} displayTitle />

			<div className="relative w-full h-full mt-8 scroll scroll-1 scroll-white overflow-x-hidden">
				{/* whiteSpace: "pre-line", // break on new line!
						wordWrap: "break-word" */}
				<p className="relative mb-24 whitespace-pre-line font-primary tracking-wide leading-6 text-left text-white font-medium">
					{media?.lyrics}
				</p>
			</div>
		</div>
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
	if (!media) return;

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
			type: reactToElectronMessage.WRITE_TAG,
			thingsToChange: [
				{ whatToChange: "album", newValue: albumName },
				{ whatToChange: "imageURL", newValue: image },
				{ whatToChange: "lyrics", newValue: lyric },
			],
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
