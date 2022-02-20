import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import type { Media } from "@common/@types/typesAndEnums";

const { writeTags } = electron.media;

const cache: Record<number, Status> = {};

export function ImgWithFallback({
	Fallback,
	media,
}: Props): EmotionJSX.Element {
	if (!media || !media.img || !media.img.length) return Fallback;
	if (cache[media.id] === Status.SUCCESS) return <img src={media.img} />;
	if (cache[media.id] === Status.FAILURE) return Fallback;

	let img: HTMLImageElement | null = new Image();
	img.onload = () => {
		cache[media.id] = Status.SUCCESS;
		console.log("SUCCESS IMG");

		img = null;
	};
	img.onerror = async ev => {
		console.error("Erasing img", ev);
		console.log("FAILED IMG");

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
	Fallback: EmotionJSX.Element;
	media?: Media;
};

enum Status {
	FAILURE,
	SUCCESS,
}
