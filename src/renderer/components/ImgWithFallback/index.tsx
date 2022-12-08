import type { Path } from "@common/@types/generalTypes";

import { reactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { eraseImg } from "@common/utils";
import { ValuesOf } from "@common/@types/utils";
import { error } from "@utils/log";

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
	mediaPath,
	Fallback,
	mediaImg,
}: Props): JSX.Element {
	if (!mediaImg?.length) return Fallback;

	const cacheStatus = cache.get(mediaPath);

	if (cacheStatus === undefined) {
		cache.set(mediaPath, PENDING);

		let img: HTMLImageElement | null = new Image();

		img.onload = () => {
			cache.set(mediaPath, SUCCESS);

			img = null;
		};

		img.onerror = (ev) => {
			error("Failed image; going to erasing it...", {
				mediaPath,
				mediaImg,
				ev,
			});

			sendMsgToBackend({
				thingsToChange: [{ newValue: eraseImg, whatToChange: "imageURL" }],
				type: reactToElectronMessage.WRITE_TAG,
				mediaPath,
			});

			cache.set(mediaPath, FAILURE);

			img = null;
		};

		img.src = mediaImg;

		return cache.get(mediaPath) === SUCCESS ? (
			<img
				className="object-cover h-11 rounded-xl before:hidden"
				decoding="async"
				loading="lazy"
				src={mediaImg}
				alt=""
			/>
		) : (
			Fallback
		);
	}

	if (cacheStatus === SUCCESS)
		return (
			<img
				className="object-cover h-11 rounded-xl before:hidden"
				src={mediaImg}
				alt=""
			/>
		);

	// else cacheStatus === FAILURE || cacheStatus === PENDING
	return Fallback;
}

/////////////////////////////////////////////
// Types:

type Props = {
	mediaImg: string | undefined;
	Fallback: JSX.Element;
	mediaPath: Path;
};
