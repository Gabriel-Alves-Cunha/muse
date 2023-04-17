import type { Path } from "@common/@types/GeneralTypes";

import { MdMusicNote as MusicNote } from "react-icons/md";

import { ReactToElectronMessageEnum } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { eraseImg } from "@common/utils";
import { ValuesOf } from "@common/@types/Utils";
import { getMedia } from "@contexts/playlists";
import { error } from "@common/log";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const statusEnum = { SUCCESS: 2, FAILURE: 3, PENDING: 4 } as const;

const { FAILURE, PENDING, SUCCESS } = statusEnum;

/////////////////////////////////////////////

const cache: Map<Path, ValuesOf<typeof statusEnum>> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ImgWithFallback({
	className = "object-cover h-11 rounded-xl",
	Fallback = <MusicNote size={17} />,
	mediaPath,
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
					type: ReactToElectronMessageEnum.WRITE_TAG,
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

type Props = Readonly<{
	mediaImg: string | undefined;
	Fallback?: JSX.Element;
	className?: string;
	mediaPath: Path;
}>;
