import type { Path } from "@common/@types/generalTypes";

import { ReactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { eraseImg } from "@common/utils";
import { ValuesOf } from "@common/@types/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const Status = { SUCCESS: 10, FAILURE: 20, PENDING: 30 } as const;
const { FAILURE, PENDING, SUCCESS } = Status;

/////////////////////////////////////////////

const cache: Map<Path, ValuesOf<typeof Status>> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ImgWithFallback(
	{ mediaPath, Fallback, mediaImg }: Props,
): JSX.Element {
	if (!mediaImg?.length) return Fallback;

	const cacheStatus = cache.get(mediaPath);

	if (cacheStatus === FAILURE || cacheStatus === PENDING) return Fallback;

	if (cacheStatus === SUCCESS)
		return <img className="object-cover h-11 rounded-xl before:hidden" src={mediaImg} />;

	cache.set(mediaPath, PENDING);

	let img: HTMLImageElement | null = new Image();

	img.onload = () => {
		cache.set(mediaPath, SUCCESS);
		// console.log(
		// 	`%c"${media.path}" img loaded with success`,
		// 	"font-weight: bold; color: blue;",
		// );
		img = null;
	};

	img.onerror = async ev => {
		console.error("Failed image; going to erasing it...", {
			mediaPath,
			mediaImg,
			ev,
		});

		sendMsgToBackend({
			thingsToChange: [{ newValue: eraseImg, whatToChange: "imageURL" }],
			type: ReactToElectronMessage.WRITE_TAG,
			mediaPath,
		});

		cache.set(mediaPath, FAILURE);

		img = null;
	};

	img.src = mediaImg;

	return cache.get(mediaPath) === SUCCESS ?
		(
			<img
				className="object-cover h-11 rounded-xl before:hidden"
				decoding="async"
				loading="lazy"
				src={mediaImg}
			/>
		) :
		(Fallback);
}

/////////////////////////////////////////////
// Types:

type Props = Readonly<
	{ Fallback: JSX.Element; mediaImg: string | undefined; mediaPath: Path; }
>;
