import type { Media, Path } from "@common/@types/generalTypes";
import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { reactToElectronMessage } from "@common/enums";
import { mediaPlayerCardId } from "@components/FlipCard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { infoToast } from "@components/toasts";
import { Header } from "./Header";
import { error } from "@utils/log";

const { searchForLyricsAndImage } = electron.lyric;

/////////////////////////////////////////

export const Lyrics: Component<Props> = (props) => {
	const [t] = useI18n();

	return (
		<div class="relative w-full h-full">
			<Header media={props.media} path={props.path} displayTitle />

			<div class="relative w-full h-full mt-8 scroll scroll-1 scroll-white overflow-x-hidden">
				{/* whiteSpace: "pre-line", // break on new line!
						wordWrap: "break-word" */}
				<p class="relative mb-24 whitespace-pre-line font-primary tracking-wide leading-6 text-left text-white font-medium">
					{props.media?.lyrics}
				</p>
			</div>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

export const flipMediaPlayerCard = (): void => {
	document.getElementById(mediaPlayerCardId)?.classList.toggle("active");
};

/////////////////////////////////////////

export async function searchAndOpenLyrics(
	media: Media | undefined,
	mediaPath: Path,
	openLyrics: boolean,
): Promise<void> {
	if (!media) return;

	const [t] = useI18n();

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

	if (media.lyrics.length > 0 && openLyrics) flipMediaPlayerCard();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = { media: Media | undefined; path: Path };
