import type { Path } from "@common/@types/generalTypes";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

enum Status {
	FAILURE,
	PENDING,
	SUCCESS,
}

const { SUCCESS, FAILURE, PENDING } = Status;

/////////////////////////////////////////////

const cache: Map<Path, Status> = new Map();

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

	if (cacheStatus === SUCCESS) return <img src={mediaImg} />;

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

	img.onerror = ev => {
		console.error("Failed img, erasing it", { ev, mediaPath, mediaImg });

		// await writeTags(media.path, { imageURL: "erase img" });
		cache.set(mediaPath, FAILURE);
		img = null;
	};

	img.src = mediaImg;

	return cache.get(mediaPath) === SUCCESS ?
		<img src={mediaImg} loading="lazy" decoding="async" /> :
		(Fallback);
}

/////////////////////////////////////////////
// Types:

type Props = Readonly<
	{ Fallback: JSX.Element; mediaImg?: string; mediaPath: Path; }
>;
