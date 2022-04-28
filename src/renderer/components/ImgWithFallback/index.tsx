import type { Media } from "@common/@types/typesAndEnums";

enum Status {
	FAILURE,
	PENDING,
	SUCCESS,
}

const { SUCCESS, FAILURE, PENDING } = Status;

const cache: Map<number, Status> = new Map();

export function ImgWithFallback({ Fallback, media }: Props): JSX.Element {
	if (!media?.img?.length) return Fallback;

	const cacheStatus = cache.get(media.id);

	if (cacheStatus === FAILURE || cacheStatus === PENDING) return Fallback;

	if (cacheStatus === SUCCESS)
		return <img src={media.img} loading="lazy" decoding="async" />;

	cache.set(media.id, PENDING);

	let img: HTMLImageElement | null = new Image();

	img.onload = () => {
		cache.set(media.id, SUCCESS);
		console.log(
			`%c"${media.path}" img loaded with success`,
			"font-weight: bold; color: blue;",
		);
		img = null;
	};

	img.onerror = ev => {
		console.error("Failed img, erasing it", ev);

		// await writeTags(media.path, { imageURL: "erase img" });
		cache.set(media.id, FAILURE);
		img = null;
	};

	img.src = media.img;

	return cache.get(media.id) === SUCCESS ? (
		<img src={media.img} loading="lazy" decoding="async" />
	) : (
		Fallback
	);
}

type Props = {
	Fallback: JSX.Element;
	media?: Media;
};
