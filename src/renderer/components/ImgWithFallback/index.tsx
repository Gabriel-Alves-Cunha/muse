import type { Path } from "@common/@types/generalTypes";

enum Status {
	FAILURE,
	PENDING,
	SUCCESS,
}

const { SUCCESS, FAILURE, PENDING } = Status;

const cache: Map<Path, Status> = new Map();

export function ImgWithFallback({
	mediaPath,
	Fallback,
	mediaImg,
}: Props): JSX.Element {
	if (!mediaImg?.length) return Fallback;

	const cacheStatus = cache.get(mediaPath);

	if (cacheStatus === FAILURE || cacheStatus === PENDING) return Fallback;

	if (cacheStatus === SUCCESS)
		return <img src={mediaImg} loading="lazy" decoding="async" />;

	cache.set(mediaPath, PENDING);

	let img: HTMLImageElement | undefined = new Image();

	img.onload = () => {
		cache.set(mediaPath, SUCCESS);
		// console.log(
		// 	`%c"${media.path}" img loaded with success`,
		// 	"font-weight: bold; color: blue;",
		// );
		img = undefined;
	};

	img.onerror = ev => {
		console.error("Failed img, erasing it", ev);

		// await writeTags(media.path, { imageURL: "erase img" });
		cache.set(mediaPath, FAILURE);
		img = undefined;
	};

	img.src = mediaImg;

	return cache.get(mediaPath) === SUCCESS ? (
		<img src={mediaImg} loading="lazy" decoding="async" />
	) : (
		Fallback
	);
}

type Props = {
	Fallback: JSX.Element;
	mediaImg?: string;
	mediaPath: Path;
};
