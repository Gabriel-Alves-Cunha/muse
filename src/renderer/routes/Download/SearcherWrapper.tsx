import { useEffect } from "react";

import { selectUrlAndError, useSearchInfo, setUrl, search } from "./helpers";
import { selectT, useTranslator } from "@i18n";
import { BaseInput } from "@components/BaseInput";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function SearcherWrapper(): JSX.Element {
	const { error, url } = useSearchInfo(selectUrlAndError);
	const t = useTranslator(selectT);

	useEffect(() => {
		const searchTimeout = setTimeout(() => search(url), 300);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<>
			<BaseInput
				label={t("labels.pasteVideoURL")}
				autoCapitalize="off"
				spellCheck="false"
				onChange={setUrl}
				autoCorrect="off"
				value={url}
			/>

			<p className="searcher">{error}</p>
		</>
	);
}
