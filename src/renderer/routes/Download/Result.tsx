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
		<div className="result">
			<img alt={t("alts.videoThumbnail")} src={imageURL} />

			<p>{title}</p>

			<Button variant="large" onPointerUp={downloadMedia}>
				{t("buttons.download")}
			</Button>
		</div>
	) : null;
}
