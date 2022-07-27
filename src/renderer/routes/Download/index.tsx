import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect } from "react";

import { useSearchInfo, downloadMedia, search, setSearchInfo } from "./helpers";
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
	useEffect(() => {
		document.title = "Download medias files to audio files";
	}, []);

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

const errorAndUrlSelectors = (
	{ error, url }: ReturnType<typeof useSearchInfo.getState>,
) => ({ error, url });

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
					Paste YouTube url here
				</label>
				<input
					onChange={e => setSearchInfo({ url: e.target.value })}
					autoCapitalize="off"
					spellCheck="false"
					autoCorrect="off"
					id="searcher:url"
					value={url}
					type="text"
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

	return <LoadingWrapper>{isLoading && <Loading />}</LoadingWrapper>;
}

////////////////////////////////////////////////

const resultSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.result;

function Result() {
	const { imageURL, title } = useSearchInfo(resultSelector);

	return title ?
		(
			<ResultContainer>
				<img src={imageURL} alt="Video thumbnail." />

				<p>{title}</p>

				<Button variant="large" onClick={downloadMedia}>Download</Button>
			</ResultContainer>
		) :
		null;
}
