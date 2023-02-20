import { useSnapshot } from "valtio";

import { downloadMedia, searchInfo } from "./helpers";
import { translation } from "@i18n";
import { Button } from "@components/Button";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function Result() {
	const translationAccessor = useSnapshot(translation);
	const searchInfoAccessor = useSnapshot(searchInfo);
	const t = translationAccessor.t;

	return searchInfoAccessor.result.title ? (
		<div className="result">
			<img
				src={searchInfoAccessor.result.imageURL}
				alt={t("alts.videoThumbnail")}
			/>

			<p>{searchInfoAccessor.result.title}</p>

			<Button variant="large" onPointerUp={downloadMedia}>
				{t("buttons.download")}
			</Button>
		</div>
	) : null;
}
