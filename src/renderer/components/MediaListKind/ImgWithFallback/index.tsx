import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";

type Props = {
	Fallback: EmotionJSX.Element;
	imgAsString: ImgAsString;
	key: string;
};

type ImgAsString = string;

const cache: Map<string, { stats: Status; img: ImgAsString }> = new Map();

export function ImgWithFallback({
	imgAsString,
	Fallback,
	key,
}: Props): EmotionJSX.Element {
	if (cache.get(key)?.stats === Status.SUCCESS)
		return <img src={imgAsString} />;

	const hasImg = imgAsString.length > 100;
	if (!hasImg) {
		if (!cache.has(key)) cache.set(key, { stats: Status.FAILURE, img: "" });

		return Fallback;
	}

	let img: HTMLImageElement | null = new Image();
	img.onload = () => {
		cache.set(key, { stats: Status.SUCCESS, img: imgAsString });
		img = null;
	};
	img.onerror = () => {
		cache.set(key, { stats: Status.FAILURE, img: "" });
		img = null;
	};
	img.src = imgAsString;

	return cache.get(key)?.stats === Status.SUCCESS ? (
		<img src={imgAsString} />
	) : (
		Fallback
	);
}

enum Status {
	FAILURE,
	SUCCESS,
}
