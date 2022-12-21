import type { ID } from "@common/@types/generalTypes";

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

const cache: Map<ID, ValuesOf<typeof status>> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ImgWithFallback({
	mediaID,
	Fallback,
	mediaImg,
}: Props): JSX.Element {
	if (!mediaImg?.length) return Fallback;

	const cacheStatus = cache.get(mediaID);

	if (!cacheStatus) {
		cache.set(mediaID, PENDING);

		let img: HTMLImageElement | null = new Image();

		img.onload = () => {
			cache.set(mediaID, SUCCESS);

			img = null;
		};

		img.onerror = (ev) => {
			error("Failed image; going to erasing it...", {
				mediaID,
				mediaImg,
				ev,
			});

			sendMsgToBackend({
				thingsToChange: [{ newValue: eraseImg, whatToChange: "imageURL" }],
				type: ReactToElectronMessage.WRITE_TAG,
				mediaPath: getMedia(mediaID)!.path,
			});

			cache.set(mediaID, FAILURE);

			img = null;
		};

		img.src = mediaImg;

		return cache.get(mediaID) === SUCCESS ? (
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
	mediaID: ID;
};
