import { downloadMedia, useSearchInfo, selectResult } from "./helpers";
import { selectT, useTranslator } from "@i18n";
import { Button } from "@components/Button";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function Result(): JSX.Element | null {
	const result = useSearchInfo(selectResult);
	const t = useTranslator(selectT);

	return result.title ? (
		<div className="result">
			<img src={result.imageURL} alt={t("alts.videoThumbnail")} />

			<p>{result.title}</p>

			<Button variant="large" onPointerUp={downloadMedia}>
				{t("buttons.download")}
			</Button>
		</div>
	) : null;
}
