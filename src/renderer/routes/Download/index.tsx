import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect } from "react";

import { useSearchInfo, downloadMedia, search, setSearchInfo } from "./helpers";
import { t, Translator } from "@components/I18n";
import { useTitle } from "@hooks/useTitle";
import { Button } from "@components/Button";
import { Header } from "@components/Header";

import { Loading } from "@styles/appStyles";
import {
	ResultContainer,
	LoadingWrapper,
	SearchWrapper,
	GridWrapper,
	Searcher,
} from "./styles";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Download() {
	useTitle(t("titles.download"));

	return (
		<GridWrapper>
			<Header>
				<SearcherWrapper />
				<IsLoading />
			</Header>

			<Result />
		</GridWrapper>
	);
}

////////////////////////////////////////////////
// Helper functions:

const setUrl = (e: React.ChangeEvent<HTMLInputElement>) =>
	setSearchInfo({ url: e.target.value });

////////////////////////////////////////////////

const errorAndUrlSelectors = (
	{ error, url }: ReturnType<typeof useSearchInfo.getState>,
) => ({ error, url });

////////////////////////////////////////////////

function SearcherWrapper() {
	const { error, url } = useSearchInfo(errorAndUrlSelectors);

	useEffect(() => {
		const searchTimeout = setTimeout(async () => await search(url), 300);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size={18} />

				<label className={url ? "active" : ""} htmlFor="searcher:url">
					<Translator path="labels.pasteVideoURL" />
				</label>

				<input
					autoCapitalize="off"
					spellCheck="false"
					onChange={setUrl}
					autoCorrect="off"
					id="searcher:url"
					value={url}
				/>
			</Searcher>

			<p>{error}</p>
		</SearchWrapper>
	);
}

////////////////////////////////////////////////

const isLoadingSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.isLoading;

function IsLoading() {
	const isLoading = useSearchInfo(isLoadingSelector);

	return <LoadingWrapper>{isLoading === true && <Loading />}</LoadingWrapper>;
}

////////////////////////////////////////////////

const resultSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.result;

function Result() {
	const { imageURL, title } = useSearchInfo(resultSelector);

	return title.length > 0 ?
		(
			<ResultContainer>
				<img src={imageURL} alt={t("alts.videoThumbnail")} />

				<p>{title}</p>

				<Button variant="large" onPointerUp={downloadMedia}>
					<Translator path="buttons.download" />
				</Button>
			</ResultContainer>
		) :
		null;
}
