import { useSnapshot } from "valtio";

import { downloadMedia, searchResult } from "./helpers";
import { translation } from "@i18n";
import { Button } from "@components/Button";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function Result() {
	const searchResultAccessor = useSnapshot(searchResult);
	const t = useSnapshot(translation).t;

	return searchResultAccessor.result.title ? (
		<div className="result">
			<img
				src={searchResultAccessor.result.imageURL}
				alt={t("alts.videoThumbnail")}
			/>

			<p>{searchResultAccessor.result.title}</p>

			<Button variant="large" onPointerUp={downloadMedia}>
				{t("buttons.download")}
			</Button>
		</div>
	) : null;
}
