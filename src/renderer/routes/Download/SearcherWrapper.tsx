import { useSnapshot } from "valtio";
import { useEffect } from "react";

import { search, setUrl, searchResult } from "./helpers";
import { translation } from "@i18n";
import { BaseInput } from "@components/BaseInput";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function SearcherWrapper() {
	const t = useSnapshot(translation).t;
	const searchResultAccessor = useSnapshot(searchResult);

	useEffect(() => {
		const searchTimeout = setTimeout(
			() => search(searchResultAccessor.url),
			300,
		);

		return () => clearTimeout(searchTimeout);
	}, [searchResultAccessor.url]);

	return (
		<>
			<BaseInput
				label={t("labels.pasteVideoURL")}
				value={searchResultAccessor.url}
				autoCapitalize="off"
				spellCheck="false"
				autoCorrect="off"
				onChange={setUrl}
			/>

			<p className="searcher">{searchResultAccessor.error}</p>
		</>
	);
}
