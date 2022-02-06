import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";

type Props = {
	Fallback: EmotionJSX.Element;
	imgAsString: ImgAsString;
	urlAsACachekey: string;
};

type ImgAsString = string;

const cache: Map<string, { stats: Status; img: ImgAsString }> = new Map();

export function ImgWithFallback({
	urlAsACachekey,
	imgAsString,
	Fallback,
}: Props): EmotionJSX.Element {
	if (cache.get(urlAsACachekey)?.stats === Status.SUCCESS)
		return <img src={imgAsString} />;

	const hasImg = Boolean(imgAsString.length);
	if (!hasImg) {
		if (!cache.has(urlAsACachekey))
			cache.set(urlAsACachekey, { stats: Status.FAILURE, img: "" });

		return Fallback;
	}

	let img: HTMLImageElement | null = new Image();
	img.onload = () => {
		cache.set(urlAsACachekey, { stats: Status.SUCCESS, img: imgAsString });
		img = null;
	};
	img.onerror = () => {
		cache.set(urlAsACachekey, { stats: Status.FAILURE, img: "" });
		img = null;
	};
	img.src = imgAsString;

	return cache.get(urlAsACachekey)?.stats === Status.SUCCESS ? (
		<img src={imgAsString} />
	) : (
		Fallback
	);
}

enum Status {
	FAILURE,
	SUCCESS,
}
