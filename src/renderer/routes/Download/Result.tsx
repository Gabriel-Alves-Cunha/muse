import { downloadMedia, useSearchInfo } from "./helpers";
import { useTranslation } from "@i18n";
import { Button } from "@components/Button";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const resultSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.result;

export function Result() {
	const { imageURL, title } = useSearchInfo(resultSelector);
	const { t } = useTranslation();

	return title ? (
		<div className="flex flex-col mb-5 mt-8">
			<img
				className="object-cover h-44 w-80 shadow-reflect reflect-img transition-transform hover:transition-scale hover:scale-110 focus:scale-x-110"
				alt={t("alts.videoThumbnail")}
				src={imageURL}
			/>

			<p className="my-8 mx-4 font-primary text-center text-lg text-normal">
				{title}
			</p>

			<Button variant="large" onPointerUp={downloadMedia}>
				{t("buttons.download")}
			</Button>
		</div>
	) : null;
}
