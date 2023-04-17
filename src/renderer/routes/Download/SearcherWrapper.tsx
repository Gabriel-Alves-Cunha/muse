import { useEffect } from "react";

import { SearcherInfo, search, setUrl, useSearchInfo } from "./helpers";
import { selectT, useTranslator } from "@i18n";
import { BaseInput } from "@components/BaseInput";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const selectUrlAndError = (
	state: SearcherInfo,
): { error: string; url: string } => ({
	error: state.error,
	url: state.url,
});

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
				autoCorrect="off"
				onChange={setUrl}
				value={url}
			/>

			<p className="searcher">{error}</p>
		</>
	);
}
