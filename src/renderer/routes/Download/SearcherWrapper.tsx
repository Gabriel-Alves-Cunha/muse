import { useEffect } from "react";

import { search, setUrl, useSearchInfo } from "./helpers";
import { useTranslation } from "@i18n";
import { BaseInput } from "@components/BaseInput";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const errorAndUrlSelectors = ({
	error,
	url,
}: ReturnType<typeof useSearchInfo.getState>) => [error, url] as const;

export function SearcherWrapper() {
	const [error, url] = useSearchInfo(errorAndUrlSelectors);
	const { t } = useTranslation();

	useEffect(() => {
		const searchTimeout = setTimeout(() => search(url).then(), 300);

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

			<p className="searcher">
				{error}
			</p>
		</>
	);
}
