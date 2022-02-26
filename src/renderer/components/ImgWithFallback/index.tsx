import type { Media } from "@common/@types/typesAndEnums";

const { writeTags } = electron.media;

const cache: Record<number, Status> = {};

export function ImgWithFallback({ Fallback, media }: Props): JSX.Element {
	if (
		!media ||
		!media.img ||
		!media.img.length ||
		cache[media.id] === Status.FAILURE
	)
		return Fallback;
	if (cache[media.id] === Status.SUCCESS) return <img src={media.img} />;

	let img: HTMLImageElement | null = new Image();
	img.onload = () => {
		cache[media.id] = Status.SUCCESS;

		img = null;
	};
	img.onerror = async ev => {
		console.error("Failed img, erasing it", ev);

		// await writeTags(media.path, { imageURL: "erase img" });
		cache[media.id] = Status.FAILURE;
		img = null;
	};
	img.src = media.img;

	return cache[media.id] === Status.SUCCESS ? (
		<img src={media.img} />
	) : (
		Fallback
	);
}

type Props = {
	Fallback: JSX.Element;
	media?: Media;
};

enum Status {
	FAILURE,
	SUCCESS,
}
