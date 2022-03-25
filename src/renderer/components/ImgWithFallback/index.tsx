import type { Media } from "@common/@types/typesAndEnums";

// const { writeTags } = electron.media;

enum Status {
	FAILURE,
	PENDING,
	SUCCESS,
}

const { SUCCESS, FAILURE, PENDING } = Status;

const cache: Record<number, Status> = {};

export function ImgWithFallback({ Fallback, media }: Props): JSX.Element {
	if (
		!media?.img?.length ||
		cache[media.id] === FAILURE ||
		cache[media.id] === PENDING
	)
		return Fallback;
	if (cache[media.id] === SUCCESS) return <img src={media.img} />;

	cache[media.id] = PENDING;

	let img: HTMLImageElement | null = new Image();

	img.onload = () => {
		cache[media.id] = SUCCESS;
		console.log(
			`%c"${media.path}" img loaded with success`,
			"font-weight: bold; color: blue;",
		);
		img = null;
	};

	img.onerror = async ev => {
		console.error("Failed img, erasing it", ev);

		// await writeTags(media.path, { imageURL: "erase img" });
		cache[media.id] = FAILURE;
		img = null;
	};

	img.src = media.img;

	return cache[media.id] === SUCCESS ? <img src={media.img} /> : Fallback;
}

type Props = {
	Fallback: JSX.Element;
	media?: Media;
};
