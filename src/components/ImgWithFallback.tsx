import type { ValuesOf } from "types/utils";
import type { Path } from "types/generalTypes";

import { eraseImg } from "@utils/utils";
import { getMedia } from "@contexts/usePlaylists";
import { error } from "@utils/log";
import { writeTags } from "@modules/media/writeTags";

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
					mediaPath,
					mediaImg,
					e,
				});

				writeTags(mediaPath, { imageURL: eraseImg }).then();
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
