import { useSnapshot } from "valtio";
import { useEffect } from "react";

import { search, setUrl, searchInfo } from "./helpers";
import { translation } from "@i18n";
import { BaseInput } from "@components/BaseInput";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function SearcherWrapper() {
	const translationAccessor = useSnapshot(translation);
	const searchInfoAccessor = useSnapshot(searchInfo);
	const t = translationAccessor.t;

	useEffect(() => {
		const searchTimeout = setTimeout(
			() => search(searchInfoAccessor.url).then(),
			300,
		);

		return () => clearTimeout(searchTimeout);
	}, [searchInfoAccessor.url]);

	return (
		<>
			<BaseInput
				label={t("labels.pasteVideoURL")}
				value={searchInfoAccessor.url}
				autoCapitalize="off"
				spellCheck="false"
				autoCorrect="off"
				onChange={setUrl}
			/>

			<p className="searcher">{searchInfoAccessor.error}</p>
		</>
	);
}
