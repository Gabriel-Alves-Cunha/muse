import type { Path } from "@common/@types/generalTypes";

import { ReactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { eraseImg } from "@common/utils";
import { ValuesOf } from "@common/@types/utils";
import { getMedia } from "@contexts/usePlaylists";
import { error } from "@common/log";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const status = { SUCCESS: 2, FAILURE: 3, PENDING: 4 } as const;

const { FAILURE, PENDING, SUCCESS } = status;

/////////////////////////////////////////////

const cache: Map<Path, ValuesOf<typeof status>> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ImgWithFallback({
	className = "object-cover h-11 rounded-xl",
	mediaPath,
	Fallback,
	mediaImg,
}: Props): JSX.Element {
	if (!mediaImg?.length) return Fallback;

	const cacheStatus = cache.get(mediaPath);

	if (!cacheStatus) {
		cache.set(mediaPath, PENDING);

		let img: HTMLImageElement | null = new Image();

		img.onload = () => {
			cache.set(mediaPath, SUCCESS);

			img = null;
		};

		img.onerror = (e) => {
			setTimeout(() => {
				error("Failed image, going to erasing it...", {
					media: getMedia(mediaPath),
					mediaImg,
					e,
				});

				sendMsgToBackend({
					thingsToChange: [{ newValue: eraseImg, whatToChange: "imageURL" }],
					type: ReactToElectronMessage.WRITE_TAG,
					mediaPath,
				});
			}, 1_000);

			cache.set(mediaPath, FAILURE);

			img = null;
		};

		img.src = mediaImg;

		return cache.get(mediaPath) === SUCCESS ? (
			<img className={className} loading="lazy" src={mediaImg} alt="" />
		) : (
			Fallback
		);
	}

	if (cacheStatus === SUCCESS)
		return <img className={className} loading="lazy" src={mediaImg} alt="" />;

	// Else cacheStatus === FAILURE || cacheStatus === PENDING
	return Fallback;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = {
	mediaImg: string | undefined;
	Fallback: JSX.Element;
	className?: string;
	mediaPath: Path;
};
